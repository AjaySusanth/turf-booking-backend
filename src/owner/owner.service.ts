import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { UserRole } from '../../generated/prisma';

@Injectable()
export class OwnerService {
    private readonly logger = new Logger(OwnerService.name)
    constructor(private prisma: PrismaService) {}

    async registerOwner(userId:string, dto:RegisterOwnerDto) {

        const user = await this.prisma.user.findUnique({where:{id:userId}})
        if(!user) throw new BadRequestException("User not found")

        if (user.role !== UserRole.USER) throw new BadRequestException('User already registered as owner or admin.');

        const existing = await this.prisma.ownerProfile.findUnique({where:{userId}})
        if (existing) throw new BadRequestException('Owner already exists')

        try {
            const profile = await this.prisma.$transaction(async(tx)=>{
                const createdProfile = await tx.ownerProfile.create({
                    data:{
                        userId,
                        businessName: dto.businessName,
                        address: dto.address
                    },
                })

                await tx.user.update({
                    where:{id:userId},
                    data:{
                        role: UserRole.TURF_OWNER
                    }
                })

                await tx.eventOutbox.create({
                    data:{
                        type: 'user.role_upgraded',
                        payload:{
                            userId:userId,
                            oldRole:user.role, newRole:UserRole.TURF_OWNER
                        }
                    }
                })

                return createdProfile
            })

            this.logger.log(`Owner registration successful for user ${userId}`);
            return { ownerProfile: profile, role: UserRole.TURF_OWNER };
    
        } catch (error) {
            this.logger.error(`Failed to register owner for user ${userId}:  ${error.message}`, error.stack);
            throw new InternalServerErrorException('Could not complete registration');
        }
    }

    async getProfile(userId:string) {
        const owner = await this.prisma.ownerProfile.findUnique({
            where:{userId},
            include:{
                user:{
                    select:{
                        name:true,email:true,phone:true,role:true
                    }
                }
            }
        
        })

        if (!owner) throw new NotFoundException("Owner profile not found")
        return owner

    }
}

