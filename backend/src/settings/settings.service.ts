import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { UpdateServicesDto } from "./dto/update-services.dto";
import { UpdateWorkingHoursDto } from "./dto/update-working-hours.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;

}

@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) { }

    async getMe(userId: number) {
        const therapist = await this.prisma.therapist.findUnique({
            where: {
                userId,
            },
            include: {
                settings: true,

                links: {
                    orderBy: {
                        sortOrder: "asc",
                    },
                },

                categories: {
                    orderBy: {
                        sortOrder: "asc",
                    },
                    include: {
                        services: {
                            orderBy: {
                                sortOrder: "asc",
                            },
                        },
                    },
                },

                practiceLocations: {
                    include: {
                        workingIntervals: {
                            orderBy: [
                                { day: "asc" },
                                { startMinutes: "asc" },
                            ],
                        },
                    },
                    orderBy: {
                        number: "asc",
                    },
                },

                user: {
                    select: {
                        email: true,
                        isVerified: true,
                    },
                },
            },
        });

        return therapist;
    }

    async getPractice(userId: number) {
        const therapist = await this.prisma.therapist.findUnique({
            where: {
                userId,
            },
            include: {
                practiceLocations: {
                    include: {
                        workingIntervals: {
                            orderBy: [
                                { day: "asc" },
                                { startMinutes: "asc" },
                            ],
                        },

                        services: {
                            include: {
                                service: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },

                    orderBy: {
                        number: "asc",
                    },
                },
            },
        });

        return therapist?.practiceLocations ?? [];
    }

    async updateMe(
        userId: number,
        data: UpdateSettingsDto,
    ) {
        return this.prisma.therapist.update({
            where: {
                userId,
            },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                gender: data.gender,
                birthDate: data.birthDate
                    ? new Date(data.birthDate)
                    : null,
                bio: data.bio,
            },
        });
    }

    async updateLocation(
        userId: number,
        locationId: number,
        data: UpdateLocationDto,
    ) {
        return this.prisma.practiceLocation.update({
            where: {
                id: locationId,
                therapist: {
                    userId,
                },
            },
            data: {
                name: data.name,
                country: data.country,
                city: data.city,
                address: data.address,
                notes: data.notes,
                isActive: data.isActive,
            },
        });
    }

    async createLocation(userId: number) {
        const therapist = await this.prisma.therapist.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!therapist) {
            throw new Error("Therapist not found.");
        }
        const locations = await this.prisma.practiceLocation.findMany({
            where: {
                therapistId: therapist.id,
            },
            select: {
                number: true,
            },
            orderBy: {
                number: "asc",
            },
        });
        let nextNumber = 1;

        for (const location of locations) {
            if (location.number === nextNumber) {
                nextNumber++;
            } else {
                break;
            }
        }
        return this.prisma.practiceLocation.create({
            data: {
                therapistId: therapist.id,

                number: nextNumber,

                name: `Location ${nextNumber}`,
                type: "office",

                country: "",
                city: "",
                address: "",

                notes: null,

                isActive: true,
            },
        });
    }

    async updateServices(
        userId: number,
        dto: UpdateServicesDto,
    ) {
        const therapist = await this.prisma.therapist.findUnique({
            where: {
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!therapist) {
            throw new NotFoundException('Therapist not found');
        }

        const { categories } = dto;
        console.dir(categories, { depth: null });

        const existingCategories = await this.prisma.category.findMany({
            where: {
                therapistId: therapist.id,
            },
            select: {
                id: true,
                name: true,
                description: true,
                color: true,
                sortOrder: true,
                isActive: true,
            },
        });

        const existingMap = new Map(
            existingCategories.map(category => [category.id, category]),
        );

        for (const category of categories) {
            if (category.id < 0) {
                await this.prisma.category.create({
                    data: {
                        therapistId: therapist.id,
                        name: category.name,
                        description: category.description,
                        color: category.color,
                        sortOrder: category.sortOrder,
                        isActive: category.isActive,

                        services: {
                            create: category.services.map(service => ({
                                name: service.name,
                                description: service.description,
                                defaultDurationMinutes: service.defaultDurationMinutes,
                                defaultPrice: service.defaultPrice,
                                currency: service.currency,
                                color: service.color,
                                isActive: service.isActive,
                            })),
                        },
                    },
                });

                continue;
            }

            const existing = existingMap.get(category.id);

            if (!existing) {
                continue;
            }

            const existingServices = await this.prisma.service.findMany({
                where: {
                    categoryId: category.id,
                },
            });

            const serviceMap = new Map(
                existingServices.map(service => [service.id, service]),
            );

            if (
                existing.name !== category.name ||
                existing.description !== category.description ||
                existing.color !== category.color ||
                existing.sortOrder !== category.sortOrder ||
                existing.isActive !== category.isActive
            ) {
                await this.prisma.category.update({
                    where: {
                        id: category.id,
                    },
                    data: {
                        name: category.name,
                        description: category.description,
                        color: category.color,
                        sortOrder: category.sortOrder,
                        isActive: category.isActive,
                    },
                });
            }

            for (const service of category.services) {
                if (service.id < 0) {
                    await this.prisma.service.create({
                        data: {
                            categoryId: category.id,
                            name: service.name,
                            description: service.description,
                            defaultDurationMinutes: service.defaultDurationMinutes,
                            defaultPrice: service.defaultPrice,
                            currency: service.currency,
                            color: service.color,
                            isActive: service.isActive,
                        },
                    });

                    continue;
                }

                const existingService = serviceMap.get(service.id);

                if (!existingService) {
                    continue;
                }

                if (
                    existingService.name !== service.name ||
                    existingService.description !== service.description ||
                    existingService.defaultDurationMinutes !== service.defaultDurationMinutes ||
                    existingService.defaultPrice !== service.defaultPrice ||
                    existingService.currency !== service.currency ||
                    existingService.color !== service.color ||
                    existingService.isActive !== service.isActive
                ) {
                    await this.prisma.service.update({
                        where: {
                            id: service.id,
                        },
                        data: {
                            name: service.name,
                            description: service.description,
                            defaultDurationMinutes: service.defaultDurationMinutes,
                            defaultPrice: service.defaultPrice,
                            currency: service.currency,
                            color: service.color,
                            isActive: service.isActive,
                        },
                    });
                }
            }

            const incomingServiceIds = new Set(
                category.services
                    .filter(service => service.id > 0)
                    .map(service => service.id),
            );

            for (const existingService of existingServices) {
                if (!incomingServiceIds.has(existingService.id)) {
                    await this.prisma.service.delete({
                        where: {
                            id: existingService.id,
                        },
                    });
                }
            }

        }

        const incomingCategoryIds = new Set(
            categories
                .filter(category => category.id > 0)
                .map(category => category.id),
        );

        for (const existingCategory of existingCategories) {
            if (!incomingCategoryIds.has(existingCategory.id)) {
                await this.prisma.service.deleteMany({
                    where: {
                        categoryId: existingCategory.id,
                    },
                });

                await this.prisma.category.delete({
                    where: {
                        id: existingCategory.id,
                    },
                });
            }
        }

        return {
            success: true,
            categoriesCount: categories.length,
        };
    }
    async updateWorkingHours(
        userId: number,
        dto: UpdateWorkingHoursDto,
    ) {
        const therapist = await this.prisma.therapist.findUnique({
            where: {
                userId,
            },
        });

        if (!therapist) {
            throw new Error("Therapist not found.");
        }

        const location = await this.prisma.practiceLocation.findFirst({
            where: {
                id: dto.locationId,
                therapistId: therapist.id,
            },
        });

        if (!location) {
            throw new Error("Practice location not found.");
        }

        for (const day of Object.keys(dto.workingHours)) {
            const intervals = dto.workingHours[day];

            await this.prisma.workingInterval.deleteMany({
                where: {
                    practiceLocationId: location.id,
                    day: day as any,
                },
            });

            for (let index = 0; index < intervals.length; index++) {
                const interval = intervals[index];

                await this.prisma.workingInterval.create({
                    data: {
                        practiceLocationId: location.id,
                        day: day as any,
                        startMinutes: timeToMinutes(interval.start),
                        endMinutes: timeToMinutes(interval.end),
                        type: interval.type as any,
                        sortOrder: index,
                    },
                });
            }
        }

        return {
            success: true,
        };
    }

}