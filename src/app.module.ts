import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { OwnerModule } from './owner/owner.module';
import { TurfModule } from './turf/turf.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule.forRoot({ isGlobal: true }), OwnerModule, TurfModule, MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
