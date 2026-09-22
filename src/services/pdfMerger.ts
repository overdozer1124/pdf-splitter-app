import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import type {
  MergePdfItem,
  MergeOptions,
  MergeGroupOutput,
  MergeProgress
} from '../types/merge';
import { addBookmarksToPdfDoc, type BookmarkEntry } from './pdfBookmarkHelper';

const CMAP_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/';
const STANDARD_FONT_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/standard_fonts/';

/**
 * Group merge items according to MergeOptions (all / byFileCount / byPageCount)
 */
export function groupMergeItems(
  items: MergePdfItem[],
  options: MergeOptions,
  baseFileName: string = 'merged.pdf'
): MergeGroupOutput[] {
  if (items.length === 0) return [];

  const baseName = baseFileName.replace(/\.pdf$/i, '') || 'merged';
  const groups: MergeGroupOutput[] = [];

  if (options.batchMode === 'all') {
    const totalPages = items.reduce((acc, item) => acc + item.pageCount, 0);
    groups.push({
      id: 'group_all',
      index: 1,
      fileName: `${baseName}.pdf`,
      items,
      totalPages
    });
    return groups;
  }

  if (options.batchMode === 'byFileCount') {
    const chunkSize = Math.max(1, options.filesPerGroup);
    let groupIdx = 1;

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunkItems = items.slice(i, i + chunkSize);
      const totalPages = chunkItems.reduce((acc, item) => acc + item.pageCount, 0);
      const numStr = String(groupIdx).padStart(2, '0');
      const firstItemCleanName = chunkItems[0].name.replace(/\.pdf$/i, '');
      const groupFileName = `${baseName}_${numStr}_${firstItemCleanName}.pdf`;

      groups.push({
        id: `group_${groupIdx}`,
        index: groupIdx,
        fileName: groupFileName,
        items: chunkItems,
        totalPages
      });
      groupIdx++;
    }
    return groups;
  }

  if (options.batchMode === 'byPageCount') {
    const maxPages = Math.max(1, options.maxPagesPerGroup);
    let currentItems: MergePdfItem[] = [];
    let currentPages = 0;
    let groupIdx = 1;

    for (const item of items) {
      // If adding this item exceeds maxPages and currentItems is not empty, flush group
      if (currentPages + item.pageCount > maxPages && currentItems.length > 0) {
        const numStr = String(groupIdx).padStart(2, '0');
        const firstItemCleanName = currentItems[0].name.replace(/\.pdf$/i, '');
        groups.push({
          id: `group_${groupIdx}`,
          index: groupIdx,
          fileName: `${baseName}_${numStr}_${firstItemCleanName}.pdf`,
          items: currentItems,
          totalPages: currentPages
        });
        groupIdx++;
        currentItems = [item];
        currentPages = item.pageCount;
      } else {
        currentItems.push(item);
        currentPages += item.pageCount;
      }
    }

    if (currentItems.length > 0) {
      const numStr = String(groupIdx).padStart(2, '0');
      const firstItemCleanName = currentItems[0].name.replace(/\.pdf$/i, '');
      groups.push({
        id: `group_${groupIdx}`,
        index: groupIdx,
        fileName: `${baseName}_${numStr}_${firstItemCleanName}.pdf`,
        items: currentItems,
        totalPages: currentPages
      });
    }

    return groups;
  }

  return groups;
}

/**
 * Merge a single group of PDF items into PDF bytes
 */
export async function mergeSingleGroupBytes(
  items: MergePdfItem[],
  addBookmarks: boolean = true
): Promise<Uint8Array> {
  if (items.length === 0) {
    throw new Error('結合するPDFファイルがありません。');
  }

  const mergedDoc = await PDFDocument.create();
  const bookmarks: BookmarkEntry[] = [];
  let currentPageOffset = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const bookmarkTitle = item.name.replace(/\.pdf$/i, '');
    const bookmarkPageIndex = currentPageOffset;

    // Try pdf-lib copyPages first
    let copiedViaPdfLib = false;
    try {
      const bufferCopy = item.arrayBuffer.slice(0);
      const srcDoc = await PDFDocument.load(bufferCopy, { ignoreEncryption: true });
      if (!srcDoc.isEncrypted) {
        const pageIndices = srcDoc.getPageIndices();
        const pages = await mergedDoc.copyPages(srcDoc, pageIndices);
        pages.forEach((page) => mergedDoc.addPage(page));
        currentPageOffset += pages.length;
        copiedViaPdfLib = true;
      }
    } catch (e) {
      copiedViaPdfLib = false;
    }

    // Fallback if encrypted or copyPages failed
    if (!copiedViaPdfLib) {
      const addedPages = await appendEncryptedPdf(item.arrayBuffer, mergedDoc);
      currentPageOffset += addedPages;
    }

    if (addBookmarks) {
      bookmarks.push({
        title: bookmarkTitle,
        pageIndex: bookmarkPageIndex
      });
    }
  }

  // Embed bookmarks / outlines
  if (addBookmarks && bookmarks.length > 0) {
    addBookmarksToPdfDoc(mergedDoc, bookmarks);
  }

  return await mergedDoc.save();
}

/**
 * Main export function for PDF Merge tool
 * Returns single PDF Blob if 1 group, or ZIP Blob if multiple groups
 */
export async function exportMergedPdfs(
  groups: MergeGroupOutput[],
  addBookmarks: boolean,
  onProgress?: (progress: MergeProgress) => void
): Promise<{ type: 'single' | 'zip'; blob: Blob; fileName: string }> {
  if (groups.length === 0) {
    throw new Error('結合するPDFグループがありません。');
  }

  // Single PDF Output
  if (groups.length === 1) {
    const group = groups[0];
    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        status: `「${group.fileName}」を結合中...`
      });
    }

    const pdfBytes = await mergeSingleGroupBytes(group.items, addBookmarks);
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    return {
      type: 'single',
      blob,
      fileName: group.fileName
    };
  }

  // Multiple PDFs -> ZIP Output
  const zip = new JSZip();
  const total = groups.length;

  for (let g = 0; g < total; g++) {
    const group = groups[g];
    if (onProgress) {
      onProgress({
        current: g + 1,
        total,
        status: `グループ ${g + 1}/${total} 「${group.fileName}」を結合中...`
      });
    }

    const pdfBytes = await mergeSingleGroupBytes(group.items, addBookmarks);
    zip.file(group.fileName, pdfBytes, { compression: 'STORE' });
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      status: 'ZIPファイルを圧縮・作成中...'
    });
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'STORE' },
    (metadata) => {
      if (onProgress) {
        onProgress({
          phase: 'zipping',
          current: Math.round((metadata.percent / 100) * total),
          total
        } as any);
      }
    }
  );

  return {
    type: 'zip',
    blob: zipBlob,
    fileName: 'merged_pdfs.zip'
  };
}

/**
 * Legacy merge function (kept for backward compatibility & tests)
 */
export async function mergePdfs(
  items: MergePdfItem[],
  _onProgress?: (progress: MergeProgress) => void
): Promise<Blob> {
  const bytes = await mergeSingleGroupBytes(items, true);
  return new Blob([bytes as any], { type: 'application/pdf' });
}

/**
 * Helper to append pages from encrypted/fallback PDF using pdfjs-dist
 */
async function appendEncryptedPdf(
  arrayBuffer: ArrayBuffer,
  targetDoc: PDFDocument
): Promise<number> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer.slice(0)),
    cMapUrl: CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: STANDARD_FONT_URL
  });
  const pdfJsDoc = await loadingTask.promise;
  const numPages = pdfJsDoc.numPages;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  for (let p = 1; p <= numPages; p++) {
    const page = await pdfJsDoc.getPage(p);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    const scale = 2.0; // 300 DPI equivalent
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: ctx,
      viewport
    }).promise;

    const imgDataUrl = canvas.toDataURL('image/png');
    const imgBytes = dataUrlToUint8Array(imgDataUrl);
    const embeddedImg = await targetDoc.embedPng(imgBytes);

    const pdfPage = targetDoc.addPage([unscaledViewport.width, unscaledViewport.height]);
    pdfPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: unscaledViewport.width,
      height: unscaledViewport.height
    });
  }

  canvas.width = 0;
  canvas.height = 0;
  return numPages;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binaryStr = atob(base64);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}
