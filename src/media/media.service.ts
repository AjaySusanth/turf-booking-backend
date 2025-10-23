import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { ConfirmMediaDto } from './dto/confirm-media.dto';
import { BulkConfirmDto } from './dto/bulk-confirm.dto';
import { ReorderDto } from './dto/reorder.dto';

@Injectable()
export class MediaService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof cloudinaryV2,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME')!;
    this.apiKey = this.config.get<string>('CLOUDINARY_API_KEY')!;
    this.apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET')!;
  }

  /**
   * Generate a signed Cloudinary upload URL
   * for client-side direct uploads.
   */
  generateUploadSignature(folder: string, type: 'image' | 'video' = 'image') {
    const timestamp = Math.floor(Date.now() / 1000);

    const signature = this.cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      this.apiSecret,
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.cloudName}/${type}/upload`,
      formData: {
        api_key: this.apiKey,
        timestamp,
        folder,
        signature,
      },
    };
  }

  /**
   * Confirm a single upload and store it in the Media table.
   */
  async confirmUpload(dto: ConfirmMediaDto) {
    const { entityType, entityId, url, publicId, format, size, mediaType } =
      dto;

    if (!entityType || !entityId || !publicId || !url) {
      throw new BadRequestException('Missing upload data');
    }

    // ✅ Optional: Verify that the file actually exists on Cloudinary
    const uploadInfo = await this.verifyCloudinaryResource(publicId);
    if (!uploadInfo) {
      throw new BadRequestException(
        'Cloudinary upload not found or not verified',
      );
    }

    // ✅ Save the media record in the database
    return this.prisma.media.create({
      data: {
        entityType,
        entityId,
        publicId,
        url,
        format: format ?? uploadInfo.format,
        size: size ?? uploadInfo.bytes,
        mediaType:
          mediaType ??
          (uploadInfo.resource_type === 'video' ? 'VIDEO' : 'IMAGE'),
        status: 'UPLOADED',
      },
    });
  }

  /**
   * Confirm multiple uploads in bulk.
   */
  async bulkConfirmUpload(dto: BulkConfirmDto) {
    const results = await Promise.all(
      dto.items.map((item) => this.confirmUpload(item)),
    );
    return results;
  }

  /**
   * Verify a Cloudinary resource exists and is accessible.
   */
  private async verifyCloudinaryResource(publicId: string) {
    try {
      return await this.cloudinary.api.resource(publicId);
    } catch (error) {
      if (error?.http_code === 404) return null;
      throw new BadRequestException('Error verifying Cloudinary resource');
    }
  }

  /**
   * Mark one media record as primary and unset others for the same entity.
   */
  async setPrimaryMedia(entityType: string, entityId: string, mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException('Media not found');

    await this.prisma.$transaction([
      this.prisma.media.updateMany({
        where: { entityType, entityId },
        data: { isPrimary: false },
      }),
      this.prisma.media.update({
        where: { id: mediaId },
        data: { isPrimary: true },
      }),
    ]);

    return { message: 'Primary media set successfully' };
  }

  /**
   * Reorder media (for gallery ordering).
   */
  async reorderMedia(entityType: string, entityId: string, dto: ReorderDto) {
    const updates = dto.order.map(({ id, sortOrder }) =>
      this.prisma.media.update({ where: { id }, data: { sortOrder } }),
    );

    await this.prisma.$transaction(updates);
    return { message: 'Media reordered successfully' };
  }

  /**
   * Delete media from Cloudinary and the database.
   */
  async deleteMedia(mediaId: string) {
    // 1️⃣ Find the media first
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException('Media not found');

    const { entityId, entityType } = media;

    // 2️⃣ Delete the media
    await this.prisma.media.delete({ where: { id: mediaId } });

    // 3️⃣ Get remaining media for the same entity
    const remaining = await this.prisma.media.findMany({
      where: { entityId, entityType },
      orderBy: { sortOrder: 'asc' },
    });

    const hasOrder = remaining.some((m) => m.sortOrder !== null);

    // 4️⃣ Reassign clean sort orders (1, 2, 3, ...)
    if (hasOrder) {
        for (let i = 0; i < remaining.length; i++) {
        await this.prisma.media.update({
            where: { id: remaining[i].id },
            data: { sortOrder: i + 1 },
        });
        }
    }

    return {
      message: 'Media deleted and sort order updated',
      deletedId: mediaId,
      entityId,
      entityType,
    };
  }
}
