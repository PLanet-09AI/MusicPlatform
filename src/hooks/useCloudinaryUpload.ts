import { useState, useCallback } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import type { CloudinaryUploadOptions, CloudinaryResponse } from '@/lib/cloudinary/types';

export function useCloudinaryUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (options: Omit<CloudinaryUploadOptions, 'onProgress'>): Promise<CloudinaryResponse> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadToCloudinary({
        ...options,
        onProgress: (p) => {
          // Use requestAnimationFrame to prevent too many state updates
          requestAnimationFrame(() => {
            setProgress(p);
          });
        }
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    upload,
    progress,
    isUploading,
    error,
  };
}