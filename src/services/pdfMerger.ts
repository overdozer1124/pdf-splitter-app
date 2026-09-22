import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { MergePdfItem, MergeProgress } from '../types/merge';

const CMAP_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/';
const STANDARD_FONT_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/standard_fonts/';

/**
 * Merge multiple PDF items in order into a single PDF Blob
 */
export async function mergePdfs(
  items: MergePdfItem[],
  onProgress?: (progress: MergeProgress) => void
): Promise<Blob> {
  if (items.length === 0) {
    throw new Error('結合するPDFファイルがありません。');
  }

  const mergedDoc = await PDFDocument.create();
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        status: `「${item.name}」を結合中 (${i + 1}/${total})...`
      });
    }

    // Try pdf-lib copyPages first if not encrypted
    let copiedViaPdfLib = false;
    try {
      const bufferCopy = item.arrayBuffer.slice(0);
      const srcDoc = await PDFDocument.load(bufferCopy, { ignoreEncryption: true });
      if (!srcDoc.isEncrypted) {
        const pageIndices = srcDoc.getPageIndices();
        const pages = await mergedDoc.copyPages(srcDoc, pageIndices);
        pages.forEach((page) => mergedDoc.addPage(page));
        copiedViaPdfLib = true;
      }
    } catch (e) {
      copiedViaPdfLib = false;
    }

    // Fallback if encrypted or copyPages failed: High-res CJK rendering with pdfjs-dist
    if (!copiedViaPdfLib) {
      await appendEncryptedPdf(item.arrayBuffer, mergedDoc);
    }
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      status: 'PDFデータを生成・最適化中...'
    });
  }

  const mergedPdfBytes = await mergedDoc.save();
  return new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
}

/**
 * Helper to append pages from encrypted/fallback PDF using pdfjs-dist
 */
async function appendEncryptedPdf(
  arrayBuffer: ArrayBuffer,
  targetDoc: PDFDocument
): Promise<void> {
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
  if (!ctx) return;

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
