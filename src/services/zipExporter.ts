import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
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

  // Slice arrayBuffer to ensure a non-detached ArrayBuffer copy is passed to pdf-lib
  const bufferCopy = sourceArrayBuffer.slice(0);
  const srcDoc = await PDFDocument.load(bufferCopy);
  const zip = new JSZip();

  for (let i = 0; i < total; i++) {
    const group = groups[i];
    if (onProgress) {
      onProgress({ phase: 'splitting', current: i + 1, total });
    }

    // Create a new PDF document for this group
    const newDoc = await PDFDocument.create();

    // Copy specified pages (0-based pageIndices)
    const copiedPages = await newDoc.copyPages(srcDoc, group.pageIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    // Save as Uint8Array
    const pdfBytes = await newDoc.save();

    // Add to ZIP (STORE mode / compression level 0 for speed)
    const fileName = group.fileName || `split_${i + 1}.pdf`;
    zip.file(fileName, pdfBytes, { compression: 'STORE' });
  }

  if (onProgress) {
    onProgress({ phase: 'zipping', current: total, total });
  }

  // Generate ZIP blob
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
