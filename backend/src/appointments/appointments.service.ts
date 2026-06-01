export { };
import {
  Injectable,
  BadRequestException,
  NotFoundException,
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

  let current = new Date(startTime);
  const endDate = until ? new Date(until) : null;

  let i = 0;

  while (true) {
    // stop по дата
    if (endDate && current > endDate) break;

    // stop по брой
    if (count && i >= count) break;

    const start = new Date(current);
    const end = new Date(current);

    const baseEnd = new Date(endTime);
    end.setHours(baseEnd.getHours(), baseEnd.getMinutes());

    result.push({
      startTime: start,
      endTime: end,
    });

    current.setDate(current.getDate() + 7);
    i++;
  }

  return result;
}

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService, private pushService: PushService,) { }

  async create(dto: any, userId: number) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
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
    // console.log("OFFSETS:", REMINDER_OFFSETS);
    try {
      const appointment = await this.prisma.appointment.create({
        data: {
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
          clientId: Number(dto.clientId), // 🔥 важно
          therapistId: therapist.id,
          status: 'scheduled',
          notes: dto.notes ?? null,
        },
        include: {
          client: true,
        },
      });

      // === AUTO REMINDERS START ===
      const REMINDER_OFFSETS = [72, 24, 1];
      const now = new Date();

      let chosenSendAt: Date | null = null;

      // 🔥 намираме най-близкия валиден reminder
      for (const hours of REMINDER_OFFSETS) {
        const sendAt = new Date(appointment.startTime);
        sendAt.setHours(sendAt.getHours() - hours);

        if (sendAt > now) {
          chosenSendAt = sendAt;
          break;
        }
      }

      // 🔥 fallback ако всички са в миналото
      if (!chosenSendAt) {
        chosenSendAt = new Date(now.getTime() + 60 * 1000);
      }

      // 🔥 защита от duplicate
      const exists = await this.prisma.message.findFirst({
        where: {
          appointmentId: appointment.id,
          type: 'reminder',
          sendAt: chosenSendAt,
        },
      });

      if (!exists) {
        await this.prisma.message.create({
          data: {
            therapistId: appointment.therapistId,
            clientId: appointment.clientId,
            appointmentId: appointment.id,
            type: 'reminder',
            sendAt: chosenSendAt,
            status: 'pending',
          },
        });
      } else {
        console.log("SKIP DUPLICATE REMINDER");
      }
      // === AUTO REMINDERS END ===


      return appointment;
    } catch (err) {
      console.error("CREATE ERROR BACKEND:", err); // 🔥
      throw err;
    }
  }

  async findByDate(date: string, userId: number) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    return this.prisma.appointment.findMany({
      where: {
        therapistId: therapist.id,
        startTime: { gte: start, lte: end },
        status: { not: 'cancelled' },
      },
      include: {
        client: true,
      },
    });
  }

  async createRecurring(data: any) {
    const {
      clientId,
      therapistId,
      startTime,
      endTime,
      until,
      count
    } = data;

    const series = await this.prisma.recurringSeries.create({
      data: {
        clientId,
        therapistId,
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

    await this.prisma.appointment.createMany({
      data: dates.map(d => ({
        ...d,
        clientId,
        therapistId,
        seriesId: series.id
      }))
    });

    return series;
  }

  async findAll(userId: number) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }
    // -----
    // return this.prisma.appointment.findMany({
    //   where: {
    //     therapistId: therapist.id,
    //     status: { not: 'cancelled' },
    //   },
    //   include: {
    //     client: true,
    //   },
    // });
    const appointments = await this.prisma.appointment.findMany({
      where: {
        therapistId: therapist.id,
        status: { not: 'cancelled' },
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

    return appointments.filter(a => {
      if (!a.seriesId) return true;

      if (!a.isException) {
        return !exceptionMap.has(
          new Date(a.startTime).toISOString()
        );
      }

      return true;
    });
    // -------

  }

  async findOne(id: number, userId: number) {
    if (!id) {
      throw new NotFoundException('Invalid appointment id');
    }

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
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
    status: 'scheduled' | 'completed' | 'cancelled',
    userId: number,
  ) {
    const appointment = await this.findOne(id, userId);

    return this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status },
    });
  }

  async delete(id: number, userId: number) {
    const appointment = await this.findOne(id, userId);

    console.log("APPOINTMENT CANCELLED");

    // 🔥 СПРИ REMINDERS
    await this.prisma.message.updateMany({
      where: {
        appointmentId: appointment.id,
        status: 'pending',
      },
      data: {
        status: 'cancelled',
      },
    });

    return this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'cancelled',
      },
    });
  }

  async remove(id: number, userId: number) {
    const appointment = await this.findOne(id, userId);

    console.log("APPOINTMENT CANCELLED");

    // 🔥 СПРИ REMINDERS (старото поведение)
    await this.prisma.message.updateMany({
      where: {
        appointmentId: appointment.id,
        status: 'pending',
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
    });

    if (!therapist) {
      throw new NotFoundException('Therapist not found');
    }

    return this.prisma.appointment.findMany({
      where: {
        therapistId: therapist.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  // async update(id: number, dto: any, userId: number) {
  //   const therapist = await this.prisma.therapist.findUnique({
  //     where: { userId },
  //   });

  //   if (!therapist) {
  //     throw new NotFoundException('Therapist not found');
  //   }

  //   const updated = await this.prisma.appointment.update({
  //     where: {
  //       id,
  //     },
  //     data: {
  //       ...(dto.startTime && { startTime: new Date(dto.startTime) }),
  //       ...(dto.endTime && { endTime: new Date(dto.endTime) }),
  //       ...(dto.notes !== undefined && { notes: dto.notes }),
  //     },
  //     include: {
  //       client: true,
  //     },
  //   });
  //   const appointment = updated; // 🔥 TEMP FIX

  //   // 🔥 ако има промяна на часа → обнови reminders
  //   if (dto.startTime) {
  //     // 🔥 1. винаги трием старите (safe)
  //     await this.prisma.message.deleteMany({
  //       where: {
  //         appointmentId: id,
  //         type: 'reminder',
  //       },
  //     });

  //     // -----------------------------------------
  //     const REMINDER_OFFSETS = [72, 24, 1];
  //     const now = new Date();

  //     let chosenSendAt = null;

  //     // 🔥 намираме най-близкия валиден
  //     for (const hours of REMINDER_OFFSETS) {
  //       const sendAt = new Date(appointment.startTime);
  //       sendAt.setHours(sendAt.getHours() - hours);

  //       if (sendAt > now) {
  //         chosenSendAt = sendAt;
  //         break; // 🔥 първият валиден = най-близкия
  //       }
  //     }

  //     // 🔥 fallback
  //     if (!chosenSendAt) {
  //       chosenSendAt = new Date(now.getTime() + 60 * 1000);
  //     }

  //     // 🔥 създаваме САМО 1
  //     await this.prisma.message.create({
  //       data: {
  //         therapistId: updated.therapistId,
  //         clientId: updated.clientId,
  //         appointmentId: updated.id,
  //         type: 'reminder',
  //         sendAt: chosenSendAt,
  //         status: 'pending',
  //       },
  //     });
  //     // --------------------------------------

  //     // 🔥 fallback (само ако няма нито един)
  //     // if (!created) {
  //     //   const fallbackTime = new Date(now.getTime() + 60 * 1000);

  //     //   const exists = await this.prisma.message.findFirst({
  //     //     where: {
  //     //       appointmentId: updated.id,
  //     //       type: 'reminder',
  //     //       sendAt: fallbackTime,
  //     //     },
  //     //   });

  //     //   if (!exists) {
  //     //     await this.prisma.message.create({
  //     //       data: {
  //     //         therapistId: updated.therapistId,
  //     //         clientId: updated.clientId,
  //     //         appointmentId: updated.id,
  //     //         type: 'reminder',
  //     //         sendAt: fallbackTime,
  //     //         status: 'pending',
  //     //       },
  //     //     });
  //     //   }
  //     // }
  //   }
  //   return updated;
  // }

  async update(id: number, data: any) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Invalid appointment id');
    }

    // нормална среща
    if (!appointment.seriesId) {
      const safeData: any = {
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      };

      // само ако ги има
      if (data.clientId) safeData.clientId = data.clientId;
      if (data.therapistId) safeData.therapistId = data.therapistId;

      return this.prisma.appointment.update({
        where: { id },
        data: safeData
      });
    }

    // recurring → exception

    await this.prisma.appointment.create({
      data: {
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),

        clientId: appointment.clientId,
        therapistId: appointment.therapistId,

        seriesId: appointment.seriesId,

        originalDate: appointment.startTime,
        isException: true,

        status: 'scheduled'
      }
    });

    await this.prisma.appointment.update({
      where: { id },
      data: {
        isCancelled: true,
        status: 'cancelled'
      }
    });

    return { success: true };
  }

}