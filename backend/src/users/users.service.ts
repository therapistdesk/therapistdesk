import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,

        therapist: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {

  }
}