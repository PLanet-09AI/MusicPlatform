export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/m4a'
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB

export const UPLOAD_ERRORS = {
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_TYPE: 'File type not supported',
  NETWORK_ERROR: 'Network error occurred during upload',
  UNKNOWN: 'An unknown error occurred'
} as const;