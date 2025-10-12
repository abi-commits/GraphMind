export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  isStarred: boolean;
  content?: string;
  summary?: string;
  tags?: string[];
  status: 'uploading' | 'processing' | 'ready' | 'error';
  processingProgress?: number;
}

export interface DocumentFilter {
  type: 'all' | 'starred' | 'recent' | 'pdf' | 'txt' | 'docx';
  label: string;
}

export interface DocumentStats {
  total: number;
  byType: Record<string, number>;
  totalSize: number;
  starred: number;
}