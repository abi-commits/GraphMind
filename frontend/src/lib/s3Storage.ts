/**
 * AWS S3 Storage Helper for GraphMind Frontend
 * Handles document uploads, deletions, and URL generation via backend API
 */

import axios from 'axios';

// Use the same API URL as api.ts for consistency
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// Check if the base URL already includes the API prefix
const BASE_URL = API_BASE_URL.endsWith(API_PREFIX) 
  ? API_BASE_URL 
  : `${API_BASE_URL}${API_PREFIX}`;

interface UploadResponse {
  success: boolean;
  message: string;
  s3_url: string;
  presigned_url: string;
  s3_key: string;
  filename: string;
  content_type: string;
  size: number;
}

interface UrlResponse {
  success: boolean;
  url: string;
  expires_in: number;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Upload a document to S3 via backend API
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Upload response with S3 URLs and metadata
 */
export const uploadDocumentToS3 = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<UploadResponse>(
      `${BASE_URL}/documents/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'Upload failed');
    }
    throw new Error('Upload failed: Network error');
  }
};

/**
 * Delete a document from S3
 * @param s3Key - The S3 key of the document to delete
 * @returns True if deletion was successful
 */
export const deleteDocumentFromS3 = async (s3Key: string): Promise<boolean> => {
  try {
    const response = await axios.delete<DeleteResponse>(
      `${BASE_URL}/documents/${encodeURIComponent(s3Key)}`
    );
    return response.data.success;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
};

/**
 * Get a presigned URL for a document
 * @param s3Key - The S3 key of the document
 * @param expiration - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL for secure access
 */
export const getPresignedUrl = async (
  s3Key: string,
  expiration: number = 3600
): Promise<string> => {
  try {
    const response = await axios.get<UrlResponse>(
      `${BASE_URL}/documents/url/${encodeURIComponent(s3Key)}`,
      {
        params: { expiration },
      }
    );
    return response.data.url;
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw new Error('Failed to get document URL');
  }
};

/**
 * Format file size to human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Validate file before upload
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF, TXT, and DOCX files are allowed.',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 50MB limit. Current size: ${formatFileSize(file.size)}`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty.',
    };
  }

  return { valid: true };
};

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns File extension (e.g., "pdf")
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file is a PDF
 * @param file - The file to check
 * @returns True if file is a PDF
 */
export const isPDF = (file: File): boolean => {
  return file.type === 'application/pdf' || getFileExtension(file.name) === 'pdf';
};

/**
 * Extract S3 key from S3 URL
 * @param s3Url - The S3 URL
 * @returns The S3 key
 */
export const extractS3Key = (s3Url: string): string | null => {
  try {
    const url = new URL(s3Url);
    // Remove leading slash
    return url.pathname.substring(1);
  } catch (error) {
    console.error('Invalid S3 URL:', error);
    return null;
  }
};

/**
 * Batch upload multiple files
 * @param files - Array of files to upload
 * @param onFileProgress - Callback for individual file progress
 * @param onComplete - Callback when all uploads complete
 * @returns Array of upload results
 */
export const batchUpload = async (
  files: File[],
  onFileProgress?: (filename: string, progress: number) => void,
  onComplete?: (results: UploadResponse[]) => void
): Promise<UploadResponse[]> => {
  const results: UploadResponse[] = [];

  for (const file of files) {
    try {
      const result = await uploadDocumentToS3(file, (progress) => {
        onFileProgress?.(file.name, progress);
      });
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      // Continue with other files
    }
  }

  onComplete?.(results);
  return results;
};

export default {
  uploadDocumentToS3,
  deleteDocumentFromS3,
  getPresignedUrl,
  formatFileSize,
  validateFile,
  isPDF,
  extractS3Key,
  batchUpload,
};
