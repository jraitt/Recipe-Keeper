import { api } from './api';

export interface UploadResponse {
  success: boolean;
  data?: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
  };
  error?: string;
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (error.response?.data?.error) {
      return {
        success: false,
        error: error.response.data.error
      };
    }
    
    return {
      success: false,
      error: 'Failed to upload file'
    };
  }
};

export const getImageUrl = (filename: string): string => {
  if (!filename) return '';
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3021/api';
  return `${baseUrl}/uploads/${filename}`;
};