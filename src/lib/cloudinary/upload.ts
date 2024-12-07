import axios from 'axios';
import { CLOUDINARY_CONFIG } from '@/config/cloudinary';
import type { CloudinaryUploadOptions, CloudinaryResponse } from './types';

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;

export async function uploadToCloudinary({
  file,
  folder,
  onProgress,
  metadata = {},
  resourceType = 'auto'
}: CloudinaryUploadOptions): Promise<CloudinaryResponse> {
  const formData = new FormData();
  const timestamp = Date.now().toString();
  const uniqueFilename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', folder);
  formData.append('public_id', uniqueFilename);
  
  // Add metadata as context
  if (Object.keys(metadata).length > 0) {
    const context = Object.entries(metadata)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');
    formData.append('context', context);
  }

  try {
    const response = await axios.post<CloudinaryResponse>(UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(progress);
        }
      }
    });

    if (!response.data.secure_url) {
      throw new Error('Upload response missing secure_url');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(`Upload failed: ${message}`);
    }
    throw error;
  }
}