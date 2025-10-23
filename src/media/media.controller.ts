import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { ConfirmMediaDto } from './dto/confirm-media.dto';
import { BulkConfirmDto } from './dto/bulk-confirm.dto';
import { ReorderDto } from './dto/reorder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('TURF_OWNER')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * ✅ Generate a signed Cloudinary upload URL.
   * Clients use this to upload directly to Cloudinary without exposing secrets.
   *
   * Example:
   * GET /media/upload-signature?folder=turf-images&type=image
   */
  @Get('upload-signature')
  generateUploadSignature(
    @Query('folder') folder: string,
    @Query('type') type: 'image' | 'video' = 'image',
  ) {
    return this.mediaService.generateUploadSignature(folder, type);
  }

  /**
   * ✅ Confirm a single upload.
   * Called by the client after successfully uploading to Cloudinary.
   *
   * Example:
   * POST /media/confirm
   */
  @Post('confirm')
  confirmUpload(@Body() dto: ConfirmMediaDto) {
    return this.mediaService.confirmUpload(dto);
  }

  /**
   * ✅ Confirm multiple uploads in bulk.
   * Used after multi-image upload (e.g., gallery upload).
   *
   * Example:
   * POST /media/bulk-confirm
   */
  @Post('bulk-confirm')
  bulkConfirmUpload(@Body() dto: BulkConfirmDto) {
    return this.mediaService.bulkConfirmUpload(dto);
  }

  /**
   * ✅ Set a primary image/video for an entity (e.g., Turf).
   *
   * Example:
   * POST /media/:entityType/:entityId/set-primary/:mediaId
   */
  @Post(':entityType/:entityId/set-primary/:mediaId')
  setPrimaryMedia(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.setPrimaryMedia(entityType, entityId, mediaId);
  }

  /**
   * ✅ Reorder media for a given entity.
   *
   * Example:
   * POST /media/:entityType/:entityId/reorder
   * Body: { order: [{ id: 'media1', sortOrder: 1 }, { id: 'media2', sortOrder: 2 }] }
   */
  @Post(':entityType/:entityId/reorder')
  reorderMedia(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() dto: ReorderDto,
  ) {
    return this.mediaService.reorderMedia(entityType, entityId, dto);
  }

  /**
   * ✅ Delete a media file from Cloudinary + DB.
   *
   * Example:
   * DELETE /media/:mediaId
   */
  @Delete(':mediaId')
  deleteMedia(@Param('mediaId') mediaId: string) {
    return this.mediaService.deleteMedia(mediaId);
  }
}
