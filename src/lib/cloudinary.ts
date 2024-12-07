import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dbjqbrs3x',
  api_key: '514685791751858',
  api_secret: 'CLXsHkzpJOocANakMUMEbqIWnhw',
  secure: true,
});

export interface UploadProgress {
  progress: number;
  downloadUrl?: string;
}

export interface UploadOptions {
  folder: string;
  fileName: string;
  file: File;
  onProgress?: (progress: number) => void;
  metadata?: { [key: string]: string };
}

export class CloudinaryService {
  static async uploadFile({
    folder,
    file,
    onProgress,
    metadata
  }: UploadOptions): Promise<string> {
    try {
      // Convert File to base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            context: metadata,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(Buffer.from(base64Data, 'base64'));
      });

      onProgress?.(100);
      return result.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file. Please try again.');
    }
  }

  static async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file. Please try again.');
    }
  }

  static getPublicIdFromUrl(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}