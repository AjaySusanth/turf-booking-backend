import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTurfDto } from './dto/create-turf.dto';
import { UpdateTurfDto } from './dto/update-turf.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TurfService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Create turf
  async create(userId: string, createTurfDto: CreateTurfDto) {
    const { sports, ...dto } = createTurfDto;

    const owner = await this.prisma.ownerProfile.findUnique({ where: { userId } });
    if (!owner) throw new ForbiddenException('Owner profile not found');

    return await this.prisma.$transaction(async (tx) => {
      const turf = await tx.turf.create({
        data: {
          ...dto,
          ownerId: owner.id,
          turfSports: {
            create: sports.map((sport) => ({ sport })),
          },
        },
        include: { turfSports: true, media: true },
      });

      await tx.eventOutbox.create({
        data: {
          type: 'turf.created',
          payload: {
            ownerId: owner.id,
            turfId: turf.id,
          },
        },
      });

      return turf;
    });
  }

  // ✅ Find all turfs of the current owner
  async findAllByOwner(userId: string) {
    const owner = await this.prisma.ownerProfile.findUnique({ where: { userId } });
    if (!owner) throw new ForbiddenException('Owner profile not found');

    return this.prisma.turf.findMany({
      where: { ownerId: owner.id },
      include: { turfSports: true, media: true },
    });
  }

  // ✅ Find one turf (must belong to the current owner)
  async findOne(userId: string, turfId: string) {
    const owner = await this.prisma.ownerProfile.findUnique({ where: { userId } });
    if (!owner) throw new ForbiddenException('Owner profile not found');

    const turf = await this.prisma.turf.findUnique({
      where: { id: turfId },
      include: { turfSports: true, media: true },
    });
    if (!turf) throw new NotFoundException('Turf not found');
    if (turf.ownerId !== owner.id) throw new ForbiddenException('Access denied');

    return turf;
  }

  // ✅ Update turf
  async update(userId: string, turfId: string, updateTurfDto: UpdateTurfDto) {
    const owner = await this.prisma.ownerProfile.findUnique({ where: { userId } });
    if (!owner) throw new ForbiddenException('Owner profile not found');

    const turf = await this.prisma.turf.findUnique({ where: { id: turfId } });
    if (!turf) throw new NotFoundException('Turf not found');
    if (turf.ownerId !== owner.id) throw new ForbiddenException('Access denied');

    const { sports, ...dto } = updateTurfDto;

    return this.prisma.turf.update({
      where: { id: turfId },
      data: {
        ...dto,
        turfSports: sports
          ? {
              deleteMany: {}, // Replace existing sports
              create: sports.map((sport) => ({ sport })),
            }
          : undefined,
      },
      include: { turfSports: true, media: true },
    });
  }

  // ✅ Delete turf
  async remove(userId: string, turfId: string) {
    const owner = await this.prisma.ownerProfile.findUnique({ where: { userId } });
    if (!owner) throw new ForbiddenException('Owner profile not found');

    const turf = await this.prisma.turf.findUnique({ where: { id: turfId } });
    if (!turf) throw new NotFoundException('Turf not found');
    if (turf.ownerId !== owner.id) throw new ForbiddenException('Access denied');

    // TODO: Delete images from Cloudflare
    await this.prisma.turf.delete({ where: { id: turfId } });
    return {message:"Turf deleted successfully"}
  }
}
