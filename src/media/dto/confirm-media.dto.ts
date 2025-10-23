export class ConfirmMediaDto {
  entityType: 'TURF' | 'PLAYER' | 'TOURNAMENT';
  entityId: string;
  url: string;
  publicId: string;
  format?: string;
  size?: number;
  mediaType?: 'IMAGE' | 'VIDEO';
  altText?: string;
}
