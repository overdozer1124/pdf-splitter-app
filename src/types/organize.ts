export interface OrganizePageItem {
  id: string; // Unique ID for this page slot
  fileId: string; // Refers to the source file
  sourceFileName: string;
  sourcePageIndex: number; // 0-based index in the source PDF
  rotation: number; // 0, 90, 180, 270 (relative additional rotation)
  initialRotation?: number; // original PDF rotation
  thumbnailUrl?: string; // Data URL of rendered thumbnail
}

export interface OrganizeFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
  isEncrypted?: boolean;
}

export interface OrganizeProgress {
  current: number;
  total: number;
  status: string;
}
