import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TherapistsService {
  constructor(private prisma: PrismaService) { }

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

  // async addLocation(userId: number, data: any) {
  //   const therapist = await this.prisma.therapist.findUnique({
  //     where: { userId: userId },
  //   });

  //   if (!therapist) {
  //     throw new Error('Therapist not found');
  //   }

  //   return this.prisma.practiceLocation.create({
  //     data: {
  //       therapistId: therapist.id,
  //       name: data.name,
  //       country: data.country ?? "Bulgaria",
  //       city: data.city,
  //       address: data.address,
  //       type: data.type ?? "office",
  //       number: data.number,
  //       notes: data.notes ?? null,
  //       isActive: true,
  //     },
  //   });
  // }

  async getMyProfile(userId: number) {
    return this.prisma.therapist.findUnique({
      where: { userId: userId },
      include: {
        practiceLocations: true,
        categories: {
          include: {
            services: true,
          },
        },
        settings: true,
      }
    });
  }
}