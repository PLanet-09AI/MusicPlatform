import React, { useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { cn } from '@/lib/utils';

interface MediaUploadProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  folder: string;
  accept: string;
  maxSize?: number;
  className?: string;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onUploadComplete,
  onError,
  folder,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  className
}) => {
  const { upload, progress, isUploading } = useCloudinaryUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow uploading the same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    if (file.size > maxSize) {
      onError?.(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    try {
      const result = await upload({
        file,
        folder,
        metadata: {
          originalName: file.name,
          size: file.size.toString(),
          type: file.type
        }
      });

      if (result.secure_url) {
        onUploadComplete(result.secure_url);
      } else {
        throw new Error('Upload completed but no URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('Upload error:', errorMessage);
      onError?.(errorMessage);
    }
  }, [upload, folder, maxSize, onError, onUploadComplete]);

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        id={`media-upload-${folder}`}
        disabled={isUploading}
      />
      <label
        htmlFor={`media-upload-${folder}`}
        className={cn(
          'cursor-pointer flex items-center justify-center p-4',
          'border-2 border-dashed border-primary-gray/30 rounded-lg',
          'hover:border-accent-blue transition-colors',
          'min-h-[120px] w-full',
          isUploading && 'pointer-events-none opacity-70'
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs bg-primary-gray/20 rounded-full h-2 mb-2">
              <div
                className="bg-accent-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-primary-gray">
              {progress}% Uploading...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-primary-gray">
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-sm text-center">
              Click or drag file to upload
              <br />
              <span className="text-xs">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </span>
            </span>
          </div>
        )}
      </label>
    </div>
  );
};

export default MediaUpload;