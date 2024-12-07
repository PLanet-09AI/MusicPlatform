import { CLOUDINARY_CONFIG } from '@/config/cloudinary';

interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'scale' | 'fit';
}

export function getOptimizedImageUrl(originalUrl: string, options: TransformOptions = {}): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  
  const transformations = [
    options.width && `w_${options.width}`,
    options.height && `h_${options.height}`,
    options.quality && `q_${options.quality}`,
    options.crop && `c_${options.crop}`,
    options.format && `f_${options.format}`,
  ].filter(Boolean).join(',');

  const publicId = getPublicIdFromUrl(originalUrl);
  return `${baseUrl}/${transformations}/${publicId}`;
}

export function getOptimizedAudioUrl(originalUrl: string): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload`;
  const publicId = getPublicIdFromUrl(originalUrl);
  return `${baseUrl}/q_auto/${publicId}`;
}

function getPublicIdFromUrl(url: string): string {
  const parts = url.split('/upload/');
  return parts[1] || '';
}