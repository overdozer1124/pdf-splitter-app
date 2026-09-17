import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import type { SplitGroup } from '../types/pdf';

export interface ProgressCallbackData {
  phase: 'splitting' | 'zipping' | 'done';
  current: number;
  total: number;
}

export async function exportPdfZip(
  sourceArrayBuffer: ArrayBuffer,
  groups: SplitGroup[],
  onProgress?: (progress: ProgressCallbackData) => void
): Promise<Blob> {
  const total = groups.length;
  if (total === 0) {
    throw new Error('分割グループが存在しません。');
  }

  // Load source document via pdfjs-dist (handles ALL encrypted/protected PDFs cleanly in JS memory)
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(sourceArrayBuffer.slice(0))
  });
  const pdfJsDoc = await loadingTask.promise;

  // Try pdf-lib direct load for unencrypted PDFs
  let srcDocPdfLib: PDFDocument | null = null;
  try {
    const bufferCopy = sourceArrayBuffer.slice(0);
    srcDocPdfLib = await PDFDocument.load(bufferCopy);
  } catch (e) {
    // If encrypted or permission-flagged, srcDocPdfLib stays null and we use high-res pdfjs decryption rendering
    srcDocPdfLib = null;
  }

  const zip = new JSZip();

  for (let i = 0; i < total; i++) {
    const group = groups[i];
    if (onProgress) {
      onProgress({ phase: 'splitting', current: i + 1, total });
    }

    const newDoc = await PDFDocument.create();

    if (srcDocPdfLib) {
      // Unencrypted PDF: Copy vector pages directly for 100% loss-less text
      try {
        const copiedPages = await newDoc.copyPages(srcDocPdfLib, group.pageIndices);
        copiedPages.forEach((page) => newDoc.addPage(page));
      } catch (err) {
        // Fallback to high-res pdfjs rendering if copyPages fails
        await renderGroupPagesWithPdfJs(pdfJsDoc, group.pageIndices, newDoc);
      }
    } else {
      // Encrypted / Protected PDF: Render via pdfjs-dist at high-res (scale 2.0 = 300DPI) to decrypt page content streams
      await renderGroupPagesWithPdfJs(pdfJsDoc, group.pageIndices, newDoc);
    }

    const pdfBytes = await newDoc.save();
    const fileName = group.fileName || `split_${i + 1}.pdf`;
    zip.file(fileName, pdfBytes, { compression: 'STORE' });
  }

  if (onProgress) {
    onProgress({ phase: 'zipping', current: total, total });
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'STORE' },
    (metadata) => {
      if (onProgress) {
        onProgress({
          phase: 'zipping',
          current: Math.round((metadata.percent / 100) * total),
          total
        });
      }
    }
  );

  if (onProgress) {
    onProgress({ phase: 'done', current: total, total });
  }

  return zipBlob;
}

/**
 * Helper to render pages via pdfjs-dist onto canvas and embed as high-resolution images in pdf-lib
 */
async function renderGroupPagesWithPdfJs(
  pdfJsDoc: pdfjsLib.PDFDocumentProxy,
  pageIndices: number[],
  newDoc: PDFDocument
): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  for (const pIdx of pageIndices) {
    const page = await pdfJsDoc.getPage(pIdx + 1);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    // Render at scale 2.0 (high-res 300 DPI equivalent)
    const scale = 2.0;
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: ctx,
      viewport
    }).promise;

    // Convert canvas to JPEG data URL
    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Embed JPEG in newDoc
    const imgBytes = dataUrlToUint8Array(imgDataUrl);
    const embeddedImg = await newDoc.embedJpg(imgBytes);

    // Add page with exact original dimensions (unscaledViewport)
    const pdfPage = newDoc.addPage([unscaledViewport.width, unscaledViewport.height]);
    pdfPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: unscaledViewport.width,
      height: unscaledViewport.height
    });
  }

  // Clear canvas memory
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
