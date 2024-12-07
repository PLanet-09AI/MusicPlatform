import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

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

export class StorageService {
  static async uploadFile({
    folder,
    fileName,
    file,
    onProgress,
    metadata
  }: UploadOptions): Promise<string> {
    const safeName = encodeURIComponent(fileName.replace(/[^a-zA-Z0-9.-]/g, '_'));
    const fullPath = `${folder}/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, fullPath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: metadata,
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error('Failed to upload file. Please try again.'));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(new Error('Failed to get download URL. Please try again.'));
          }
        }
      );
    });
  }

  static async deleteFile(url: string): Promise<void> {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file. Please try again.');
    }
  }

  static async replaceFile(oldUrl: string | undefined, newFile: File, options: Omit<UploadOptions, 'file'>): Promise<string> {
    try {
      // Upload new file first
      const newUrl = await this.uploadFile({ ...options, file: newFile });

      // If successful and there's an old file, delete it
      if (oldUrl) {
        await this.deleteFile(oldUrl).catch(console.error); // Don't throw if delete fails
      }

      return newUrl;
    } catch (error) {
      throw new Error('Failed to replace file. Please try again.');
    }
  }
}