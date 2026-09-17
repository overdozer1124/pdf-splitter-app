import * as pdfjsLib from 'pdfjs-dist';
// Configure pdf.js worker using Vite local asset URL
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface LoadedPdfMeta {
  pageCount: number;
  doc: pdfjsLib.PDFDocumentProxy;
}

/**
 * Load PDF Document and handle errors cleanly in Japanese
 */
export async function loadPdfDocument(arrayBuffer: ArrayBuffer): Promise<LoadedPdfMeta> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer)
    });
    const doc = await loadingTask.promise;
    if (doc.numPages <= 0) {
      throw new Error('PDFのページ数が0です。');
    }
    return {
      pageCount: doc.numPages,
      doc
    };
  } catch (err: any) {
    if (err?.name === 'PasswordException') {
      throw new Error('このPDFはパスワードで保護されているため処理できません。');
    }
    if (err?.name === 'InvalidPDFException') {
      throw new Error('ファイルが破損しているか、対応していないPDF形式です。');
    }
    throw new Error(`PDFを読み込めませんでした: ${err?.message || '不明なエラー'}`);
  }
}

/**
 * Render a single thumbnail onto an HTMLCanvasElement
 */
export async function renderThumbnailCanvas(
  doc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number, // 0-based
  canvas: HTMLCanvasElement,
  targetWidth: number = 220
): Promise<void> {
  try {
    const page = await doc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: 1.0 });

    const scale = targetWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await (page.render as any)({
      canvasContext: ctx,
      viewport: scaledViewport,
      canvas
    }).promise;
  } catch (e) {
    console.error(`Page ${pageIndex + 1} render failed:`, e);
  }
}
