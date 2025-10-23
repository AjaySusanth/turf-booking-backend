import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'turfs',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4'],
    };
  },
});