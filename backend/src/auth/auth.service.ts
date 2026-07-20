import { Injectable, BadRequestException, Logger  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';
import { WeekDay } from "@prisma/client";

function timeToMinutes(time: string): number {
  if (!time) {
    return 0;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(dto: any) {
    const { email, password } = dto;
    this.logger.log(`REGISTER START: ${email}`);
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // временно е махнато за тестване email
    // ✅ ВАЖНО: пазим user
    const testMode = process.env.TEST_MODE === 'true';
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,

        isVerified: testMode,

        verificationCode: testMode ? null : code,
        verificationCodeExpiresAt: testMode
          ? null
          : new Date(Date.now() + 10 * 60 * 1000),

        therapist: {
          create: {
            firstName: dto.firstName || "",
            lastName: dto.lastName || "",
            phone: dto.phone || "",
            birthDate: dto.birthDate
              ? new Date(dto.birthDate.split('.').reverse().join('-'))
              : null,
            gender: dto.gender || "male",
          },
        },
      },
    });

    // ✅ SELF CLIENT (само веднъж, при register)
    // вземаме therapist с имената
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: user.id },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!therapist) {
      throw new BadRequestException('Therapist not created');
    }

    const locations = dto.practice?.locations ?? [];

    if (locations.length > 0) {
      await this.prisma.practiceLocation.createMany({
        data: locations.map((location) => ({
          therapistId: therapist.id,

          number: location.number,
          name: location.name,
          type: location.type,

          country: location.country,
          city: location.city,
          address: location.address,

          notes: location.notes || null,

          isActive: location.active ?? true,
        })),
      });
    }

    const categories = dto.practice?.categories ?? [];

    const savedCategories = [];

    for (const category of categories) {
      const createdCategory = await this.prisma.category.create({
        data: {
          therapistId: therapist.id,
          name: category.name,
          description: category.description || null,
          color: category.color,
        },
      });

      savedCategories.push(createdCategory);
    }

    const savedServices = [];
    const savedPracticeLocations = await this.prisma.practiceLocation.findMany({
      where: {
        therapistId: therapist.id,
      },
      orderBy: {
        number: "asc",
      },
    });

    let serviceIndex = 0;
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const savedCategory = savedCategories[i];

      if (!savedCategory) {
        continue;
      }

      for (const service of category.services ?? []) {
        const createdService = await this.prisma.service.create({
          data: {
            categoryId: savedCategory.id,

            name: service.name,
            description: service.description || null,

            defaultDurationMinutes:
              Number(service.defaultDurationMinutes) || null,

            defaultPrice:
              service.defaultPrice && service.defaultPrice !== ""
                ? service.defaultPrice
                : null,

            currency: service.currency || "Euro",

            color: service.color,

            sortOrder: 0,
            isActive: true,
          },
        });

        savedServices.push(createdService);
      }
    }

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      for (let j = 0; j < (category.services ?? []).length; j++) {
        const service = category.services[j];
        const savedService = savedServices[serviceIndex];

        if (!savedService) {
          continue;
        }

        for (const locationNumber of service.locations ?? []) {
          const savedLocation = savedPracticeLocations.find(
            (location) => location.number === locationNumber
          );

          if (!savedLocation) {
            continue;
          }

          await this.prisma.serviceLocation.create({
            data: {
              serviceId: savedService.id,
              practiceLocationId: savedLocation.id,
            },
          });
        }
        serviceIndex++;
      }
    }
    // /////////////////////

    const weekDays: WeekDay[] = [
      WeekDay.monday,
      WeekDay.tuesday,
      WeekDay.wednesday,
      WeekDay.thursday,
      WeekDay.friday,
      WeekDay.saturday,
      WeekDay.sunday,
    ];
    for (const location of dto.practice?.locations ?? []) {
      const savedLocation = savedPracticeLocations.find(
        (item) => item.number === location.number
      );

      if (!savedLocation) {
        continue;
      }

      for (const day of weekDays) {
        const intervals = location.workingHours?.[day] ?? [];

        for (let sortOrder = 0; sortOrder < intervals.length; sortOrder++) {
          const interval = intervals[sortOrder];

          await this.prisma.workingInterval.create({
            data: {
              practiceLocationId: savedLocation.id,

              day,

              startMinutes: timeToMinutes(interval.start),
              endMinutes: timeToMinutes(interval.end),

              type: interval.type,

              sortOrder,
            },
          });
        }
      }
    }

    await this.prisma.therapistSettings.create({
      data: {
        therapistId: therapist.id,
        reminderOffsets: JSON.stringify([10080, 1440, 60]),
        retentionMonths: 12,
      },
    });

    if (therapist) {
      const name = `${therapist.firstName || ''} ${therapist.lastName || ''}`.trim() || email;
      const token = randomUUID();

      await this.prisma.client.create({
        data: {
          name,
          email,
          therapistId: therapist.id,
          clientAccessToken: token,
        },
      });
    }
this.logger.log(`REGISTER SUCCESS: ${email}`);
    return {
      requiresVerification: !testMode,
    };
  }

  async login(dto: any) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new BadRequestException('Email not verified');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: user.id },
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
      therapist: therapist
        ? {
          firstName: therapist.firstName,
          lastName: therapist.lastName,
        }
        : null,
    };

  }

  async verifyEmail(dto: any) {
    const { email, code } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Invalid code');
    }

    if (
      user.verificationCodeExpiresAt &&
      user.verificationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Code expired');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return { success: true };
  }

  async resendCode(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { email },
      data: {
        verificationCode: newCode,
      },
    });

    return { success: true };
  }

}