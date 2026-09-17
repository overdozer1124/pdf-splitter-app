import * as pdfjsLib from 'pdfjs-dist';
// Configure pdf.js worker using Vite local asset URL
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface LoadedPdfMeta {
  pageCount: number;
  doc: pdfjsLib.PDFDocumentProxy;
}

const CMAP_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/';
const STANDARD_FONT_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/standard_fonts/';

/**
 * Load PDF Document and handle errors cleanly in Japanese
 */
export async function loadPdfDocument(arrayBuffer: ArrayBuffer): Promise<LoadedPdfMeta> {
  try {
    const bufferCopy = arrayBuffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(bufferCopy),
      cMapUrl: CMAP_URL,
      cMapPacked: true,
      standardFontDataUrl: STANDARD_FONT_URL
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

    // Fill white background for clean CJK rendering
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext: ctx,
      viewport: scaledViewport,
      canvas
    }).promise;
  } catch (e) {
    console.error(`Page ${pageIndex + 1} render failed:`, e);
  }
}

/**
 * Extract bookmarks (outlines) with their 1-based page numbers
 */
export async function extractBookmarks(doc: pdfjsLib.PDFDocumentProxy): Promise<Array<{ title: string; page: number }>> {
  try {
    const outline = await doc.getOutline();
    if (!outline) return [];

    const bookmarks: Array<{ title: string; page: number }> = [];
    
    // Helper to traverse outline tree
    const traverse = async (items: any[]) => {
      for (const item of items) {
        if (item.dest) {
          let dest = item.dest;
          if (typeof dest === 'string') {
            dest = await doc.getDestination(dest);
          }
          if (Array.isArray(dest) && dest.length > 0) {
            const pageRef = dest[0];
            let pageIndex = -1;
            try {
              pageIndex = await doc.getPageIndex(pageRef);
            } catch (e) {
              // Ignore invalid page refs
            }
            if (pageIndex >= 0) {
              bookmarks.push({ title: item.title, page: pageIndex + 1 });
            }
          }
        }
        if (item.items && item.items.length > 0) {
          await traverse(item.items);
        }
      }
    };

    await traverse(outline);
    // Sort by page number
    return bookmarks.sort((a, b) => a.page - b.page);
  } catch (err) {
    console.error('Failed to extract bookmarks:', err);
    return [];
  }
}
