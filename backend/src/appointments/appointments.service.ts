export { };
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../messages/push.service';

const REMINDER_OFFSETS = [
  60,    // 1 час
  1440,  // 24 часа
  4320,  // 72 часа
];

// 🔴 CRITICAL: cancel = status cancelled (no delete)

function generateDates({ startTime, endTime, until, count }) {
  const result = [];

  // 🔥 защита
  if (!startTime || !endTime) {
    console.log("❌ MISSING startTime / endTime");
    return [];
  }

  let current = new Date(startTime);
  const baseStart = new Date(startTime);
  const baseEnd = new Date(endTime);
  const endDate = until ? new Date(until) : null;

  console.log("START:", startTime);
  console.log("CURRENT INIT:", current);

  if (isNaN(current.getTime()) || isNaN(baseEnd.getTime())) {
    console.log("❌ INVALID DATE");
    return [];
  }

  const safeCount = count && count > 0 ? count : 1;

  for (let i = 0; i < safeCount; i++) {
    console.log("---- LOOP ----", i);
    console.log("CURRENT:", current);

    // stop по дата
    if (endDate && current > endDate) {
      console.log("🛑 STOP: endDate reached");
      break;
    }

    const start = new Date(current);

    const end = new Date(current);
    end.setHours(baseEnd.getHours(), baseEnd.getMinutes(), 0, 0);

    console.log("✅ CREATING:", {
      start: start.toISOString(),
      end: end.toISOString(),
    });

    result.push({
      startTime: start,
      endTime: end,
    });

    // ➕ +7 дни
    current.setDate(current.getDate() + 7);

    // 🔥 КРИТИЧНО: фиксираме часа (иначе се чупи)
    current.setHours(
      baseStart.getHours(),
      baseStart.getMinutes(),
      0,
      0
    );
  }

  console.log("🎯 RESULT COUNT:", result.length);

  return result;
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService, private pushService: PushService,) { }

  async create(dto: any, userId: number) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    if (dto.clientId === undefined || dto.clientId === null) {
      throw new BadRequestException("clientId is required");
    }

    if (isNaN(Number(dto.clientId))) {
      throw new BadRequestException("INVALID CLIENT ID");
    }

    console.log("CREATE DTO:", dto);

    try {
      // ✅ СЪЗДАВАМЕ СРЕЩАТА
      const appointment = await this.prisma.appointment.create({
        data: {
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
          clientId: Number(dto.clientId),
          therapistId: therapist.id,
          status: 'pending',
          notes: dto.notes ?? null,
        },
        include: {
          client: true,
        },
      });

      const start = new Date(appointment.startTime);

      const formattedDate = start.toLocaleDateString("bg-BG");
      const formattedTime = start.toLocaleTimeString("bg-BG", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const therapistName = `${therapist.firstName} ${therapist.lastName}`;

      // ✅ СЪОБЩЕНИЕ (веднага)
      await this.prisma.message.create({
        data: {
          clientId: appointment.clientId,
          therapistId: appointment.therapistId,
          appointment: {
            connect: { id: appointment.id },
          },
          type: 'appointment_created',
          content: `Имате среща с ${therapistName} на ${formattedDate} от ${formattedTime}`,
          sendAt: new Date(),
          status: 'pending', // 🔥 важно → да мине през cron
        },
      });

      // 🔥 AUTO REMINDERS
      await this.prisma.message.createMany({
        data: [
          {
            clientId: appointment.clientId,
            therapistId: appointment.therapistId,
            appointmentId: appointment.id,
            type: 'reminder_72h', // 🔥
            sendAt: new Date(start.getTime() - 72 * 60 * 60 * 1000),
            status: 'pending',
          },
          {
            clientId: appointment.clientId,
            therapistId: appointment.therapistId,
            appointmentId: appointment.id,
            type: 'reminder_24h', // 🔥
            sendAt: new Date(start.getTime() - 24 * 60 * 60 * 1000),
            status: 'pending',
          },
          {
            clientId: appointment.clientId,
            therapistId: appointment.therapistId,
            appointmentId: appointment.id,
            type: 'reminder_1h', // 🔥
            sendAt: new Date(start.getTime() - 60 * 60 * 1000),
            status: 'pending',
          },
        ],
      });

      return appointment;

    } catch (err) {
      console.error("CREATE ERROR BACKEND:", err);
      throw err;
    }
  }


  async findByDate(date: string, userId: number) {
    console.log("DATE REQUEST:", date);

    return this.prisma.appointment.findMany({
      where: {
        therapistId: userId,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async createRecurring(data: any, userId: number) {
    const {
      clientId,
      startTime,
      endTime,
      until,
      count
    } = data;

    const series = await this.prisma.recurringSeries.create({
      data: {
        clientId,
        therapistId: userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        frequency: "WEEKLY",
        interval: 1,
        daysOfWeek: "",
        until: until ? new Date(until) : null
      }
    });

    const dates = generateDates({
      startTime,
      endTime,
      until,
      count
    });

    for (const d of dates) {
      await this.prisma.appointment.create({
        data: {
          startTime: d.startTime,
          endTime: d.endTime,
          clientId,
          therapistId: userId,
          seriesId: series.id,
          status: 'pending'
        }
      });

      await this.prisma.message.create({
        data: {
          // clientId: created.clientId,
          // therapistId: created.therapistId,
          clientId: data.clientId,
          therapistId: data.therapistId,
          appointment: {
            // временно 120626
            // connect: { id: appointment.id },
          },
          type: 'appointment_created',
          content: 'Имате нова среща',
          sendAt: new Date(),
          status: 'sent',
        },
      });
    }

    return series;
  }

  async findAll(userId: number) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }
    // -----
    const appointments = await this.prisma.appointment.findMany({
      where: {
        therapistId: therapist.id,
        // status: { not: 'cancelled' },
      },
      include: {
        client: true,
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    console.log(
      "APPOINTMENTS:",
      appointments.map(a => ({
        id: a.id,
        status: a.status,
        cancelledBy: a.cancelledBy
      }))
    );

    // 🔥 махаме оригиналите ако има exception
    const exceptionMap = new Map();

    appointments.forEach(a => {
      if (a.isException && a.originalDate) {
        exceptionMap.set(
          new Date(a.originalDate).toISOString(),
          true
        );
      }
    });

    // return appointments.filter(a => {
    //   if (!a.seriesId) return true;

    //   if (!a.isException) {
    //     return !exceptionMap.has(
    //       new Date(a.startTime).toISOString()
    //     );
    //   }

    //   return true;
    // });

    return appointments;

    // -------

  }

  async findOne(id: number, userId: number) {
    if (!id) {
      throw new NotFoundException('Invalid appointment id');
    }

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        therapistId: therapist.id,
      },
      include: {
        client: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async updateStatus(
    id: number,
    tokenOrStatus: any,
    statusMaybe?: any,
    reason?: string,
    userIdMaybe?: number,
  ) {

    console.log("RAW INPUT:", {
      tokenOrStatus,
      statusMaybe,
      reason,
      userIdMaybe,
    });

    // ✅ ясен boolean
    // const isClientCall = typeof statusMaybe === 'string';
    const isClientCall = !userIdMaybe;

    let status: string;
    let cancelledBy: 'client' | 'therapist' | null = null;

    if (isClientCall) {
      status = statusMaybe === 'confirmed' ? 'scheduled' : statusMaybe;
      cancelledBy = status === 'cancelled' ? 'client' : null;
    } else {
      status = tokenOrStatus;
      cancelledBy = status === 'cancelled' ? 'therapist' : null;
    }

    // 🔍 лог 1: вход
    console.log("UPDATE INPUT:", {
      id,
      isClientCall,
      status,
      cancelledBy,
    });

    const existing = await this.prisma.appointment.findUnique({
      where: { id },
    });

    // 🔍 лог 2: какво има в DB преди update
    console.log("BEFORE UPDATE:", {
      id,
      existingStatus: existing?.status,
      existingCancelledBy: existing?.cancelledBy,
    });

    // ❗ защита
    if (
      existing?.cancelledBy === 'therapist' &&
      typeof tokenOrStatus === 'string'
    ) {
      throw new Error("Forbidden");
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status,
        cancelledBy,
        cancelledAt: status === 'cancelled' ? new Date() : null,
        cancelReason:
          status === 'cancelled' && isClientCall
            ? reason || null
            : null,
      },
    });

    // 🔍 лог 3: резултат след update
    console.log("AFTER UPDATE:", {
      id: updated.id,
      status: updated.status,
      cancelledBy: updated.cancelledBy,
    });

    // 🔥 стоп на reminders
    if (status === 'cancelled') {
      await this.prisma.message.updateMany({
        where: {
          appointmentId: id,
          status: { in: ['pending'] },
        },
        data: {
          status: 'cancelled',
        },
      });
    }

    return updated;
  }

  async delete(id: number, userId: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    console.log("APPOINTMENT CANCELLED");

    // 🔥 СПРИ REMINDERS
    await this.prisma.message.updateMany({
      where: {
        appointmentId: appointment.id,
        status: {
          in: ["pending"], // 🔧 не пипаме вече изпратените
        },
      },
      data: {
        status: "cancelled",
      },
    });

    // 🔥 CANCEL (soft)
    return this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'cancelled',
        cancelledBy: 'client', // 🔥 НОВО
        cancelledAt: new Date(), // 🔥 НОВО
      },
    });
  }

  async remove(id: number, userId: number) {
    // const appointment = await this.findOne(id, userId);
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { client: true },
    });

    console.log("APPOINTMENT CANCELLED");

    // 🔥 СПРИ REMINDERS (старото поведение)
    await this.prisma.message.updateMany({
      where: {
        // временно 120626
        // appointment: {
        //   connect: { id: appointment.id },
        // },
        appointmentId: null,
        // -------
        status: {
          in: ["sent", "pending"],
        },
      },
      data: {
        status: 'cancelled',
      },
    });

    // 🔥 НОВО: ако е recurring → НЕ трием
    if (appointment.seriesId) {
      return this.prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          isCancelled: true,
          status: 'cancelled', // 🔥 важно за стария код
        },
      });
    }

    // 🔥 старото поведение за normal appointment
    return this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'cancelled',
      },
    });
  }

  async findForUser(userId: number, query: any) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const where: any = {
      therapistId: therapist.id,
    };

    if (query?.start && query?.end) {
      const start = Number(query.start);
      const end = Number(query.end);

      if (!isNaN(start) && !isNaN(end)) {
        where.startTime = {
          gte: new Date(start),
          lte: new Date(end),
        };
      }
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        client: true,
        messages: true,
        therapist: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async markSeen(id: number, token: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!appointment) {
      throw new NotFoundException();
    }

    if (appointment.client.clientAccessToken !== token) {
      throw new UnauthorizedException();
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        seenAt: new Date(),
      },
    });
  }

  async update(id: number, data: any) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Invalid appointment id');
    }

    // 👉 нормална среща
    if (!appointment.seriesId) {
      const safeData: any = {};

      const isRescheduled =
        data.startTime &&
        new Date(data.startTime).getTime() !==
        new Date(appointment.startTime).getTime();

      if (data.startTime) safeData.startTime = new Date(data.startTime);
      if (data.endTime) safeData.endTime = new Date(data.endTime);
      if (data.clientId) safeData.clientId = data.clientId;
      if (data.therapistId) safeData.therapistId = data.therapistId;
      if (data.notes !== undefined) safeData.notes = data.notes;

      const updated = await this.prisma.appointment.update({
        where: { id },
        data: {
          ...safeData,

          ...(isRescheduled && {
            status: 'pending',
            seenAt: null,

            cancelledBy: null,
            cancelledAt: null,
            cancelReason: null,
          }),
        },
        include: { client: true },
      });

      if (isRescheduled && updated.clientId) {
        const d = new Date(updated.startTime);

        const date = d.toLocaleDateString('bg-BG');
        const time = d.toLocaleTimeString('bg-BG', {
          hour: '2-digit',
          minute: '2-digit',
        });
        console.log("RESCHEDULE PUSH TRIGGERED");
        await this.pushService.sendToClient(updated.clientId, {
          title: 'Промяна на среща',
          body: `Срещата ви е променена\n${date} • ${time}`,
          tag: `appointment-${updated.id}`,
          data: {
            appointmentId: updated.id,
            url: `/appointments/${updated.id}`,
          },
        });
      }
      return updated;
    }

    // 👉 recurring → exception
    const original = appointment;

    await this.prisma.appointment.create({
      data: {
        startTime: data.startTime
          ? new Date(data.startTime)
          : original.startTime,
        endTime: data.endTime
          ? new Date(data.endTime)
          : original.endTime,

        clientId: original.clientId,
        therapistId: original.therapistId,
        seriesId: original.seriesId,

        originalDate: original.startTime,
        isException: true,
        status: 'pending',

        notes: data.notes ?? original.notes,
      },
    });

    await this.prisma.appointment.update({
      where: { id },
      data: {
        isCancelled: true,
        status: 'cancelled',
      },
    });

    return { success: true };
  }

}