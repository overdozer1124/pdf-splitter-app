export interface SourcePdf {
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

export type SplitMode = 'single' | 'fixed' | 'range' | 'thumbnail';

export interface SplitGroup {
  id: string;
  order: number;
  pageIndices: number[]; // 0-based index
  startPage: number;    // 1-based page number
  endPage: number;      // 1-based page number
  fileName: string;     // assigned filename (including .pdf extension)
}
