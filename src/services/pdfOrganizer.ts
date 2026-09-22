import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { OrganizePageItem, OrganizeProgress } from '../types/organize';

const CMAP_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/';
const STANDARD_FONT_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/standard_fonts/';

/**
 * Construct and export a reorganized/rotated PDF based on page configurations
 */
export async function exportOrganizedPdf(
  pages: OrganizePageItem[],
  fileBuffers: Map<string, ArrayBuffer>,
  onProgress?: (progress: OrganizeProgress) => void
): Promise<Blob> {
  if (pages.length === 0) {
    throw new Error('出力するページがありません。最低1ページ以上残してください。');
  }

  const outDoc = await PDFDocument.create();
  const total = pages.length;

  // Cache loaded pdf-lib docs and pdfjs docs
  const pdfLibDocCache = new Map<string, PDFDocument | null>();
  const pdfJsDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

  // Helper to get or load pdf-lib doc
  const getPdfLibDoc = async (fileId: string): Promise<PDFDocument | null> => {
    if (pdfLibDocCache.has(fileId)) {
      return pdfLibDocCache.get(fileId) || null;
    }
    const buffer = fileBuffers.get(fileId);
    if (!buffer) return null;
    try {
      const doc = await PDFDocument.load(buffer.slice(0), { ignoreEncryption: true });
      if (!doc.isEncrypted) {
        pdfLibDocCache.set(fileId, doc);
        return doc;
      }
    } catch (e) {
      // ignore
    }
    pdfLibDocCache.set(fileId, null);
    return null;
  };

  // Helper to get or load pdfjs doc
  const getPdfJsDoc = async (fileId: string): Promise<pdfjsLib.PDFDocumentProxy | null> => {
    if (pdfJsDocCache.has(fileId)) {
      return pdfJsDocCache.get(fileId)!;
    }
    const buffer = fileBuffers.get(fileId);
    if (!buffer) return null;
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer.slice(0)),
        cMapUrl: CMAP_URL,
        cMapPacked: true,
        standardFontDataUrl: STANDARD_FONT_URL
      });
      const doc = await loadingTask.promise;
      pdfJsDocCache.set(fileId, doc);
      return doc;
    } catch (e) {
      return null;
    }
  };

  for (let i = 0; i < total; i++) {
    const pageItem = pages[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        status: `ページ ${i + 1}/${total} を処理中...`
      });
    }

    const srcPdfLib = await getPdfLibDoc(pageItem.fileId);

    if (srcPdfLib) {
      try {
        const [copiedPage] = await outDoc.copyPages(srcPdfLib, [pageItem.sourcePageIndex]);
        // Apply rotation
        const currentRot = copiedPage.getRotation().angle;
        const targetRot = (currentRot + (pageItem.rotation || 0)) % 360;
        copiedPage.setRotation(degrees(targetRot));
        outDoc.addPage(copiedPage);
        continue;
      } catch (e) {
        // Fallback to pdfjs rendering
      }
    }

    // Fallback: Render via pdfjs with rotation applied
    const srcPdfJs = await getPdfJsDoc(pageItem.fileId);
    if (srcPdfJs) {
      await renderAndEmbedPage(srcPdfJs, pageItem.sourcePageIndex, pageItem.rotation || 0, outDoc);
    }
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      status: 'PDFを生成中...'
    });
  }

  const pdfBytes = await outDoc.save();
  return new Blob([pdfBytes as any], { type: 'application/pdf' });
}

/**
 * Render a single page via pdfjs-dist with rotation and embed into outDoc
 */
async function renderAndEmbedPage(
  pdfJsDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
  additionalRotation: number,
  outDoc: PDFDocument
): Promise<void> {
  const page = await pdfJsDoc.getPage(pageIndex + 1);
  const baseRotation = page.rotate || 0;
  const netRotation = (baseRotation + additionalRotation) % 360;

  // Viewport at scale 2.0 (high-res 300DPI) with rotation
  const scale = 2.0;
  const viewport = page.getViewport({ scale, rotation: netRotation });
  const unscaledViewport = page.getViewport({ scale: 1.0, rotation: netRotation });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await (page.render as any)({
    canvasContext: ctx,
    viewport
  }).promise;

  const imgDataUrl = canvas.toDataURL('image/png');
  const imgBytes = dataUrlToUint8Array(imgDataUrl);
  const embeddedImg = await outDoc.embedPng(imgBytes);

  const pdfPage = outDoc.addPage([unscaledViewport.width, unscaledViewport.height]);
  pdfPage.drawImage(embeddedImg, {
    x: 0,
    y: 0,
    width: unscaledViewport.width,
    height: unscaledViewport.height
  });

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
