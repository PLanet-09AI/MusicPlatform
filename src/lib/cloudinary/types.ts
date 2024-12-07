export interface CloudinaryUploadOptions {
  file: File;
  folder: string;
  onProgress?: (progress: number) => void;
  metadata?: Record<string, string>;
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  created_at: string;
}

export interface CloudinaryError {
  message: string;
  code?: string;
}