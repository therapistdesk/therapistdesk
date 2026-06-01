import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(dto: any) {
    const { email, password } = dto;

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    console.log('VERIFICATION CODE:', code);

    // ✅ ВАЖНО: пазим user
    const user = await this.prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        verificationCode: code,
        verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),

        therapist: {
          create: {
            firstName: dto.firstName || "",
            lastName: dto.lastName || "",
            phone: dto.phone || "",
            birthDate: dto.birthDate
              ? new Date(dto.birthDate.split('.').reverse().join('-'))
              : null,
            gender: dto.gender || "male",

            locations: {
              create: {
                name: dto.city || "Default",
                country: dto.country || "",
                city: dto.city || "",
                address: dto.address || "",
              },
            },
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

    // 1005---
    await this.prisma.therapistSettings.create({
      data: {
        therapistId: therapist.id,
        reminderOffsets: JSON.stringify([10080, 1440, 60]),
        retentionMonths: 12,
      },
    });
    // 1005----

    if (therapist) {
      const name =
        `${therapist.firstName || ''} ${therapist.lastName || ''}`.trim() || email;

      await this.prisma.client.create({
        data: {
          name,
          email,
          therapistId: therapist.id,
        },
      });
    }

    return { requiresVerification: true };
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

    return {
      access_token: this.jwtService.sign(payload),
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

    console.log("NEW CODE:", newCode);

    return { success: true };
  }
}