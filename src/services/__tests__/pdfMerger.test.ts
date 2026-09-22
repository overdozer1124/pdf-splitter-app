import { describe, it, expect } from 'vitest';
import { PDFDocument, PDFName } from 'pdf-lib';
import { mergePdfs, groupMergeItems, exportMergedPdfs } from '../pdfMerger';
import type { MergePdfItem, MergeOptions } from '../../types/merge';

describe('pdfMerger', () => {
  it('should merge two PDF documents into one and embed bookmarks', async () => {
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
        file: new File([bytes1 as any], '売上報告書.pdf', { type: 'application/pdf' }),
        name: '売上報告書.pdf',
        size: bytes1.byteLength,
        pageCount: 2,
        arrayBuffer: bytes1.buffer.slice(0) as ArrayBuffer
      },
      {
        id: '2',
        file: new File([bytes2 as any], '企画提案書.pdf', { type: 'application/pdf' }),
        name: '企画提案書.pdf',
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

    // Verify Outlines (Bookmarks) exist in Catalog
    const catalog = mergedDoc.catalog;
    expect(catalog.has(PDFName.of('Outlines'))).toBe(true);
  });

  it('should group items by file count correctly', () => {
    const fakeItems: MergePdfItem[] = [
      { id: '1', name: 'a.pdf', pageCount: 2 } as any,
      { id: '2', name: 'b.pdf', pageCount: 3 } as any,
      { id: '3', name: 'c.pdf', pageCount: 1 } as any,
      { id: '4', name: 'd.pdf', pageCount: 4 } as any,
      { id: '5', name: 'e.pdf', pageCount: 2 } as any
    ];

    const options: MergeOptions = {
      addBookmarks: true,
      batchMode: 'byFileCount',
      filesPerGroup: 2,
      maxPagesPerGroup: 20
    };

    const groups = groupMergeItems(fakeItems, options, 'output.pdf');
    expect(groups.length).toBe(3);
    expect(groups[0].items.length).toBe(2);
    expect(groups[0].totalPages).toBe(5);
    expect(groups[1].items.length).toBe(2);
    expect(groups[1].totalPages).toBe(5);
    expect(groups[2].items.length).toBe(1);
    expect(groups[2].totalPages).toBe(2);
  });

  it('should group items by page count correctly', () => {
    const fakeItems: MergePdfItem[] = [
      { id: '1', name: 'a.pdf', pageCount: 5 } as any,
      { id: '2', name: 'b.pdf', pageCount: 4 } as any,
      { id: '3', name: 'c.pdf', pageCount: 8 } as any,
      { id: '4', name: 'd.pdf', pageCount: 2 } as any
    ];

    const options: MergeOptions = {
      addBookmarks: true,
      batchMode: 'byPageCount',
      filesPerGroup: 2,
      maxPagesPerGroup: 10
    };

    const groups = groupMergeItems(fakeItems, options, 'output.pdf');
    // Group 1: a(5) + b(4) = 9
    // Group 2: c(8) + d(2) = 10
    expect(groups.length).toBe(2);
    expect(groups[0].totalPages).toBe(9);
    expect(groups[1].totalPages).toBe(10);
  });

  it('should export multiple groups as a ZIP file', async () => {
    const doc1 = await PDFDocument.create();
    doc1.addPage([200, 200]);
    const bytes1 = await doc1.save();

    const items: MergePdfItem[] = [
      {
        id: '1',
        file: new File([bytes1 as any], 'doc1.pdf', { type: 'application/pdf' }),
        name: 'doc1.pdf',
        size: bytes1.byteLength,
        pageCount: 1,
        arrayBuffer: bytes1.buffer.slice(0) as ArrayBuffer
      },
      {
        id: '2',
        file: new File([bytes1 as any], 'doc2.pdf', { type: 'application/pdf' }),
        name: 'doc2.pdf',
        size: bytes1.byteLength,
        pageCount: 1,
        arrayBuffer: bytes1.buffer.slice(0) as ArrayBuffer
      }
    ];

    const options: MergeOptions = {
      addBookmarks: true,
      batchMode: 'byFileCount',
      filesPerGroup: 1,
      maxPagesPerGroup: 20
    };

    const groups = groupMergeItems(items, options, 'batch.pdf');
    const result = await exportMergedPdfs(groups, true);

    expect(result.type).toBe('zip');
    expect(result.fileName).toBe('merged_pdfs.zip');
    expect(result.blob).toBeInstanceOf(Blob);
  });

  it('should throw error when items list is empty', async () => {
    await expect(mergePdfs([])).rejects.toThrow('結合するPDFファイルがありません。');
  });
});
