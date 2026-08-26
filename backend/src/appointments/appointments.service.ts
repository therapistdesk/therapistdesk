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

  if (isNaN(current.getTime()) || isNaN(baseEnd.getTime())) {
    console.log("❌ INVALID DATE");
    return [];
  }

  const safeCount = count && count > 0 ? count : 1;

  for (let i = 0; i < safeCount; i++) {

    // stop по дата
    if (endDate && current > endDate) {
      console.log("🛑 STOP: endDate reached");
      break;
    }

    const start = new Date(current);

    const end = new Date(current);
    end.setHours(baseEnd.getHours(), baseEnd.getMinutes(), 0, 0);

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

    try {
      // ✅ СЪЗДАВАМЕ СРЕЩАТА
      console.log("CREATE SERVICE ID:", dto.serviceId);
      const appointment = await this.prisma.appointment.create({
        data: {
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
          clientId: Number(dto.clientId),
          therapistId: therapist.id,
          practiceLocationId: dto.practiceLocationId ?? null,
          serviceId: dto.serviceId ?? null,
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
          content: 'Appointment created',
          sendAt: new Date(),
          status: 'pending', // 🔥 важно → да мине през cron
        },
      });
      // да записва само валидни срещи
      const now = new Date();

      const reminders = [];

      const reminderConfigs = [
        { type: 'reminder_72h', minutes: 72 * 60 },
        { type: 'reminder_24h', minutes: 24 * 60 },
        { type: 'reminder_1h', minutes: 60 },
      ];

      for (const r of reminderConfigs) {
        const sendAt = new Date(
          start.getTime() - r.minutes * 60 * 1000
        );

        // Ако моментът за напомняне вече е минал, пропускаме го
        if (sendAt <= now) {
          continue;
        }

        reminders.push({
          clientId: appointment.clientId,
          therapistId: appointment.therapistId,
          appointmentId: appointment.id,
          type: r.type,
          sendAt,
          status: "pending",
        });
      }

      if (reminders.length > 0) {
        await this.prisma.message.createMany({
          data: reminders,
        });
      }

      return appointment;

    } catch (err) {
      throw err;
    }
  }


  async findByDate(date: string, userId: number) {
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
      practiceLocationId,
      serviceId,
      startTime,
      endTime,
      until,
      count,
    } = data;

    if (!clientId) {
      throw new BadRequestException('clientId is required');
    }

    if (!startTime || !endTime) {
      throw new BadRequestException('startTime and endTime are required');
    }

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    const dates = generateDates({
      startTime,
      endTime,
      until,
      count,
    });

    if (dates.length === 0) {
      throw new BadRequestException('No valid recurring dates');
    }

    const series = await this.prisma.recurringSeries.create({
      data: {
        clientId: Number(clientId),
        therapistId: therapist.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: '',
        until: until ? new Date(until) : null,
      },
    });

    for (const d of dates) {
      const appointment = await this.prisma.appointment.create({
        data: {
          startTime: d.startTime,
          endTime: d.endTime,
          clientId: Number(clientId),
          therapistId: therapist.id,
          practiceLocationId: practiceLocationId
            ? Number(practiceLocationId)
            : null,
          serviceId: serviceId
            ? Number(serviceId)
            : null,
          seriesId: series.id,
          status: 'pending',
        },
      });

      await this.prisma.message.create({
        data: {
          clientId: appointment.clientId,
          therapistId: appointment.therapistId,
          appointment: {
            connect: { id: appointment.id },
          },
          type: 'appointment_created',
          content: 'Имате нова среща',
          sendAt: new Date(),
          status: 'pending',
        },
      });
    }

    return {
      success: true,
      seriesId: series.id,
      appointmentsCount: dates.length,
    };
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

    // ✅ ясен boolean
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

    const existing = await this.prisma.appointment.findUnique({
      where: { id },
    });

    // ❗ защита
    if (
      isClientCall &&
      existing?.cancelledBy === 'therapist'
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

    // 🔥 СПРИ REMINDERS (старото поведение)
    await this.prisma.message.updateMany({
      where: {
        appointmentId: null,
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
        service: true,
        practiceLocation: true,
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

  // async update(id: number, data: any) {
  //   const appointment = await this.prisma.appointment.findUnique({
  //     where: { id },
  //   });

  //   if (!appointment) {
  //     throw new NotFoundException('Invalid appointment id');
  //   }

  //   // 👉 нормална среща
  //   if (!appointment.seriesId) {
  //     const safeData: any = {};

  //     const isRescheduled =
  //       data.startTime &&
  //       new Date(data.startTime).getTime() !==
  //       new Date(appointment.startTime).getTime();

  //     if (data.startTime) safeData.startTime = new Date(data.startTime);
  //     if (data.endTime) safeData.endTime = new Date(data.endTime);
  //     if (data.clientId) safeData.clientId = data.clientId;
  //     if (data.therapistId) safeData.therapistId = data.therapistId;
  //     if (data.notes !== undefined) safeData.notes = data.notes;

  //     const updated = await this.prisma.appointment.update({
  //       where: { id },
  //       data: {
  //         ...safeData,

  //         ...(isRescheduled && {
  //           status: 'pending',
  //           seenAt: null,

  //           cancelledBy: null,
  //           cancelledAt: null,
  //           cancelReason: null,
  //         }),
  //       },
  //       include: {
  //         client: true,
  //         therapist: true,
  //       },
  //     });

  //     if (isRescheduled && updated.clientId) {
  //       const d = new Date(updated.startTime);
  //       const therapistName = updated.therapist
  //         ? `${updated.therapist.firstName} ${updated.therapist.lastName}`
  //         : 'Вашият терапевт';

  //       const date = d.toLocaleDateString('bg-BG');
  //       const time = d.toLocaleTimeString('bg-BG', {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //       });
  //       // console.log("RESCHEDULE PUSH TRIGGERED");

  //       await this.pushService.sendToClient(updated.clientId, {
  //         title: '🔄 Срещата е променена',
  //         body:
  //           `${updated.client?.name ? updated.client.name + ',\n' : ''}` +
  //           `${date} • ${time}\n` +
  //           `Терапевт: ${therapistName}`,
  //         tag: `appointment-${updated.id}`,
  //         data: {
  //           appointmentId: updated.id,
  //           url: `/appointments/${updated.id}`,
  //         },
  //       });
  //     }
  //     return updated;
  //   }

  //   // 👉 recurring → exception
  //   const original = appointment;

  //   await this.prisma.appointment.create({
  //     data: {
  //       startTime: data.startTime
  //         ? new Date(data.startTime)
  //         : original.startTime,
  //       endTime: data.endTime
  //         ? new Date(data.endTime)
  //         : original.endTime,

  //       clientId: original.clientId,
  //       therapistId: original.therapistId,
  //       seriesId: original.seriesId,

  //       originalDate: original.startTime,
  //       isException: true,
  //       status: 'pending',

  //       notes: data.notes ?? original.notes,
  //     },
  //   });

  //   await this.prisma.appointment.update({
  //     where: { id },
  //     data: {
  //       isCancelled: true,
  //       status: 'cancelled',
  //     },
  //   });

  //   return { success: true };
  // }

  async update(id: number, data: any) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Invalid appointment id');
    }

    // 👉 Нормална среща
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
        include: {
          client: true,
          therapist: true,
        },
      });

      if (isRescheduled && updated.clientId) {
        const d = new Date(updated.startTime);

        const therapistName = updated.therapist
          ? `${updated.therapist.firstName} ${updated.therapist.lastName}`
          : 'Вашият терапевт';

        const date = d.toLocaleDateString('bg-BG');

        const time = d.toLocaleTimeString('bg-BG', {
          hour: '2-digit',
          minute: '2-digit',
        });

        await this.pushService.sendToClient(updated.clientId, {
          title: '🔄 Срещата е променена',
          body:
            `${updated.client?.name ? updated.client.name + ',\n' : ''}` +
            `${date} • ${time}\n` +
            `Терапевт: ${therapistName}`,
          tag: `appointment-${updated.id}`,
          data: {
            appointmentId: updated.id,
            url: `/appointments/${updated.id}`,
          },
        });
      }

      return updated;
    }

    // 👉 Recurring exception — местим съществуващия exception
    if (appointment.isException) {
      const safeData: any = {};

      const isRescheduled =
        data.startTime &&
        new Date(data.startTime).getTime() !==
        new Date(appointment.startTime).getTime();

      if (data.startTime) {
        safeData.startTime = new Date(data.startTime);
      }

      if (data.endTime) {
        safeData.endTime = new Date(data.endTime);
      }

      if (data.clientId) {
        safeData.clientId = data.clientId;
      }

      if (data.therapistId) {
        safeData.therapistId = data.therapistId;
      }

      if (data.notes !== undefined) {
        safeData.notes = data.notes;
      }

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
            isCancelled: false,
          }),
        },
        include: {
          client: true,
          therapist: true,
        },
      });

      if (isRescheduled && updated.clientId) {
        const d = new Date(updated.startTime);

        const therapistName = updated.therapist
          ? `${updated.therapist.firstName} ${updated.therapist.lastName}`
          : 'Вашият терапевт';

        const date = d.toLocaleDateString('bg-BG');

        const time = d.toLocaleTimeString('bg-BG', {
          hour: '2-digit',
          minute: '2-digit',
        });

        await this.pushService.sendToClient(updated.clientId, {
          title: '🔄 Срещата е променена',
          body:
            `${updated.client?.name ? updated.client.name + ',\n' : ''}` +
            `${date} • ${time}\n` +
            `Терапевт: ${therapistName}`,
          tag: `appointment-${updated.id}`,
          data: {
            appointmentId: updated.id,
            url: `/appointments/${updated.id}`,
          },
        });
      }

      return updated;
    }

    // 👉 Recurring original → exception
    const original = appointment;

    const exception = await this.prisma.appointment.create({
      data: {
        startTime: data.startTime
          ? new Date(data.startTime)
          : original.startTime,

        endTime: data.endTime
          ? new Date(data.endTime)
          : original.endTime,

        clientId: original.clientId,
        therapistId: original.therapistId,
        practiceLocationId: original.practiceLocationId,
        serviceId: original.serviceId,
        seriesId: original.seriesId,

        originalDate: original.startTime,
        isException: true,
        status: 'pending',

        notes: data.notes ?? original.notes,
      },

      include: {
        client: true,
        therapist: true,
      },
    });

    // await this.prisma.appointment.update({
    //   where: { id },
    //   data: {
    //     isCancelled: true,
    //     status: 'cancelled',
    //   },
    // });
    await this.prisma.appointment.update({
      where: { id },
      data: {
        isCancelled: true,
        status: 'cancelled',
        cancelledBy: 'therapist',
        cancelledAt: new Date(),
        cancelReason: 'Преместена',
      },
    });

    if (exception.clientId) {
      const d = new Date(exception.startTime);

      const therapistName = exception.therapist
        ? `${exception.therapist.firstName} ${exception.therapist.lastName}`
        : 'Вашият терапевт';

      const date = d.toLocaleDateString('bg-BG');

      const time = d.toLocaleTimeString('bg-BG', {
        hour: '2-digit',
        minute: '2-digit',
      });

      await this.pushService.sendToClient(exception.clientId, {
        title: '🔄 Срещата е променена',
        body:
          `${exception.client?.name ? exception.client.name + ',\n' : ''}` +
          `${date} • ${time}\n` +
          `Терапевт: ${therapistName}`,
        tag: `appointment-${exception.id}`,
        data: {
          appointmentId: exception.id,
          url: `/appointments/${exception.id}`,
        },
      });
    }

    return {
      success: true,
      appointment: exception,
    };
  }

}