import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TherapistsService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: number, data: any) {
    return this.prisma.therapist.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async addLocation(userId: number, data: any) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId: userId },
    });

    if (!therapist) {
      throw new Error('Therapist not found');
    }

    return this.prisma.therapistLocation.create({
      data: {
        name: data.name,
        city: data.city,
        address: data.address,
        country: "Bulgaria",
        therapist: {
          connect: { id: therapist.id },
        },
      },
    });
  }

  async getMyProfile(userId: number) {
    return this.prisma.therapist.findUnique({
      where: { userId: userId },
      include: {
        locations: true,
        services: true,
      },
    });
  }
}