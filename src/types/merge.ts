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

export type MergeBatchMode = 'all' | 'byFileCount' | 'byPageCount';

export interface MergeOptions {
  addBookmarks: boolean;
  batchMode: MergeBatchMode;
  filesPerGroup: number;
  maxPagesPerGroup: number;
}

export interface MergeGroupOutput {
  id: string;
  index: number;
  fileName: string;
  items: MergePdfItem[];
  totalPages: number;
}

export interface MergeProgress {
  current: number;
  total: number;
  status: string;
}
