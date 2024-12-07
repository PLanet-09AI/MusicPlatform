import { ALLOWED_AUDIO_TYPES, ALLOWED_IMAGE_TYPES, MAX_AUDIO_SIZE, MAX_IMAGE_SIZE } from './constants';

export function validateFile(file: File, type: 'audio' | 'image'): string | null {
  // Check file size
  const maxSize = type === 'audio' ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
  }

  // Check file type
  const allowedTypes = type === 'audio' ? ALLOWED_AUDIO_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return `File type ${file.type} is not supported`;
  }

  return null;
}