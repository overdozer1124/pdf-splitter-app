export interface MergePdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
  thumbnailUrl?: string;
  isEncrypted?: boolean;
}

export interface MergeProgress {
  current: number;
  total: number;
  status: string;
}
