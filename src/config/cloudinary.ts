export const CLOUDINARY_CONFIG = {
  cloudName: 'dbjqbrs3x',
  uploadPreset: 'musichub_uploads',
  folders: {
    songs: 'musichub/songs',
    covers: 'musichub/covers',
    profiles: 'musichub/profiles'
  }
} as const;

// Validate required configuration
if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
  throw new Error('Missing required Cloudinary configuration');
}