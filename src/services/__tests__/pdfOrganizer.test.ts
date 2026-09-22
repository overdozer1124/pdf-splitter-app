import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { exportOrganizedPdf } from '../pdfOrganizer';
import type { OrganizePageItem } from '../../types/organize';

describe('pdfOrganizer', () => {
  it('should reorder, rotate and delete pages correctly', async () => {
    // Create source doc with 3 pages
    const doc = await PDFDocument.create();
    doc.addPage([100, 100]); // Page 0
    doc.addPage([200, 200]); // Page 1
    doc.addPage([300, 300]); // Page 2
    const docBytes = await doc.save();
    const docBuffer = docBytes.buffer.slice(0) as ArrayBuffer;

    const fileBuffers = new Map<string, ArrayBuffer>();
    fileBuffers.set('file1', docBuffer);

    // Reorder: Page 2 (with 90 deg rotation) followed by Page 0 (with 180 deg rotation)
    // Page 1 is deleted (omitted)
    const pages: OrganizePageItem[] = [
      {
        id: 'p1',
        fileId: 'file1',
        sourceFileName: 'test.pdf',
        sourcePageIndex: 2,
        rotation: 90
      },
      {
        id: 'p2',
        fileId: 'file1',
        sourceFileName: 'test.pdf',
        sourcePageIndex: 0,
        rotation: 180
      }
    ];

    const outBlob = await exportOrganizedPdf(pages, fileBuffers);
    expect(outBlob).toBeInstanceOf(Blob);

    const outBuffer = await outBlob.arrayBuffer();
    const outDoc = await PDFDocument.load(outBuffer);

    expect(outDoc.getPageCount()).toBe(2);

    const outPage1 = outDoc.getPage(0);
    expect(outPage1.getWidth()).toBe(300);
    expect(outPage1.getRotation().angle).toBe(90);

    const outPage2 = outDoc.getPage(1);
    expect(outPage2.getWidth()).toBe(100);
    expect(outPage2.getRotation().angle).toBe(180);
  });

  it('should throw error when page list is empty', async () => {
    const fileBuffers = new Map<string, ArrayBuffer>();
    await expect(exportOrganizedPdf([], fileBuffers)).rejects.toThrow(
      '出力するページがありません。'
    );
  });
});
