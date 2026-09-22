import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfs } from '../pdfMerger';
import type { MergePdfItem } from '../../types/merge';

describe('pdfMerger', () => {
  it('should merge two PDF documents into one', async () => {
    // Create Doc 1 with 2 pages
    const doc1 = await PDFDocument.create();
    doc1.addPage([200, 200]);
    doc1.addPage([200, 200]);
    const bytes1 = await doc1.save();

    // Create Doc 2 with 3 pages
    const doc2 = await PDFDocument.create();
    doc2.addPage([200, 200]);
    doc2.addPage([200, 200]);
    doc2.addPage([200, 200]);
    const bytes2 = await doc2.save();

    const items: MergePdfItem[] = [
      {
        id: '1',
        file: new File([bytes1 as any], 'doc1.pdf', { type: 'application/pdf' }),
        name: 'doc1.pdf',
        size: bytes1.byteLength,
        pageCount: 2,
        arrayBuffer: bytes1.buffer.slice(0) as ArrayBuffer
      },
      {
        id: '2',
        file: new File([bytes2 as any], 'doc2.pdf', { type: 'application/pdf' }),
        name: 'doc2.pdf',
        size: bytes2.byteLength,
        pageCount: 3,
        arrayBuffer: bytes2.buffer.slice(0) as ArrayBuffer
      }
    ];

    const mergedBlob = await mergePdfs(items);
    expect(mergedBlob).toBeInstanceOf(Blob);

    const mergedBuffer = await mergedBlob.arrayBuffer();
    const mergedDoc = await PDFDocument.load(mergedBuffer);
    expect(mergedDoc.getPageCount()).toBe(5);
  });

  it('should throw error when items list is empty', async () => {
    await expect(mergePdfs([])).rejects.toThrow('結合するPDFファイルがありません。');
  });
});
