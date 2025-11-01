/**
 * API Client for GraphMind Backend
 * Handles all HTTP requests to the FastAPI backend
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';
const BASE_URL = `${API_BASE_URL}${API_PREFIX}`;

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueryRequest {
  query: string;
  top_k?: number;
  include_summary?: boolean;
  include_knowledge_graph?: boolean;
  file_path?: string;
}

export interface QueryResponse {
  success: boolean;
  summary?: string;
  knowledge_graph?: any;
  entities?: Array<{
    name: string;
    type: string;
    description: string;
    confidence: number;
  }>;
  relationships?: Array<{
    source: string;
    target: string;
    type: string;
    description: string;
    confidence: number;
  }>;
  visualization_data?: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      description: string;
      confidence: number;
    }>;
    edges: Array<{
      source: string;
      target: string;
      type: string;
      description: string;
      confidence: number;
    }>;
  };
  relevant_chunks?: Array<{
    content: string;
    metadata: any;
  }>;
  processing_steps?: string[];
  processing_time?: number;
  error?: string;
  timestamp: string;
}

export interface DocumentProcessRequest {
  s3_key: string;
  chunk_size: number;
  chunk_overlap: number;
  process_in_background: boolean;
}

export interface DocumentProcessResponse {
  success: boolean;
  message: string;
  document_name?: string;
  documents_processed?: number;
  chunks_created?: number;
  processing_time?: number;
  processing_steps?: string[];
  task_id?: string;
  error?: string;
  timestamp: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  progress?: number;
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  components: Record<string, string>;
}

// HTTP Client Class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(300000), // 5 minute timeout for query processing
    };

    const config = { ...defaultOptions, ...options };

    try {
      const startTime = Date.now();
      const response = await fetch(url, config);
      const responseTime = Date.now() - startTime;
      
      // Log slow requests
      if (responseTime > 5000) {
        console.warn(`Slow API response for ${endpoint}: ${responseTime}ms`);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Provide more specific error messages
        if (response.status === 413) {
          throw new Error('File too large. Please try a smaller file.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 503) {
          throw new Error('Backend is temporarily unavailable. Please try again later.');
        }
        
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection and try again.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your connection.');
        }
      }
      
      throw error;
    }
  }

  // Health Check
  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async checkReadiness(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/ready');
  }

  async deepHealthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health/deep');
  }

  // File Upload with Progress
  async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<{
    success: boolean;
    message: string;
    s3_url: string;
    s3_key: string;
    presigned_url: string;
    filename: string;
    content_type: string;
    size: number;
  }> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      // Set timeout to 5 minutes
      xhr.timeout = 300000;

      xhr.open('POST', `${this.baseUrl}/documents/upload`);
      xhr.send(formData);
    });
  }

  // Query Documents
  async queryDocuments(request: QueryRequest): Promise<QueryResponse> {
    return this.request<QueryResponse>('/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Document Processing
  async processDocument(request: DocumentProcessRequest): Promise<DocumentProcessResponse> {
    return this.request<DocumentProcessResponse>('/documents/process', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Task Management
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    return this.request<TaskStatusResponse>(`/tasks/${taskId}`);
  }

  async getAllTasks(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>('/tasks');
  }

  async cleanupTasks(): Promise<{ deleted_count: number; message: string }> {
    return this.request<{ deleted_count: number; message: string }>('/tasks/cleanup', {
      method: 'POST',
    });
  }

  // Document Stats
  async getDocumentStats(): Promise<{
    success: boolean;
    total_documents: number;
    collection_metadata: any;
    background_tasks: number;
  }> {
    return this.request('/documents/stats');
  }

  // File Upload (if you implement file upload endpoint)
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<DocumentProcessResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${this.baseUrl}/documents/upload`);
      xhr.send(formData);
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Helper functions
export const isApiAvailable = async (): Promise<boolean> => {
  try {
    await apiClient.checkHealth();
    return true;
  } catch {
    return false;
  }
};

export const waitForApi = async (maxRetries = 10, delayMs = 1000): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    if (await isApiAvailable()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
};