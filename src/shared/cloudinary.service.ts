import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import path from 'path';
import * as streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CloudinaryService {
  /**
   * Upload a file buffer to Cloudinary
   * @param file - Multer file object
   * @param folder - Cloudinary folder name (e.g. 'guide-certificates', 'avatars')
   */
  constructor() {
    // Configure Cloudinary once when the service is instantiated
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    const originalName = path
      .parse(file.originalname) // { name: 'Untitled design', ext: '.png' }
      .name // 'Untitled design'
      .replace(/\s+/g, '_'); // 'Untitled_design'

    const publicId = `${Date.now()}-${uuidv4()}-${originalName}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload multiple files to Cloudinary
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadApiResponse[]> {
    return Promise.all(files.map((file) => this.uploadFile(file, folder)));
  }

  /**
   * Delete a file from Cloudinary by public_id
   */
  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
