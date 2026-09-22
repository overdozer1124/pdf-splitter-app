import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFString,
  PDFRef
} from 'pdf-lib';

export interface BookmarkEntry {
  title: string;
  pageIndex: number; // 0-based target page index in merged doc
}

/**
 * Encode a UTF-8 / Japanese string to a PDFString with UTF-16BE BOM (\xFE\xFF)
 * to prevent character corruption in all standard PDF readers (Adobe Acrobat, Chrome, etc.)
 */
export function createUtf16PdfString(text: string): PDFString {
  // UTF-16BE BOM: 0xFE, 0xFF
  const codeUnits: number[] = [0xfe, 0xff];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    codeUnits.push((code >> 8) & 0xff);
    codeUnits.push(code & 0xff);
  }
  const binaryStr = String.fromCharCode(...codeUnits);
  return PDFString.of(binaryStr);
}

/**
 * Embed an Outlines (Bookmarks / Table of Contents) hierarchy into a PDFDocument
 */
export function addBookmarksToPdfDoc(
  doc: PDFDocument,
  bookmarks: BookmarkEntry[]
): void {
  if (bookmarks.length === 0) return;

  const context = doc.context;
  const catalog = doc.catalog;
  const pages = doc.getPages();

  if (pages.length === 0) return;

  // Root Outlines Dictionary
  const outlinesDict = context.obj({
    Type: PDFName.of('Outlines'),
    Count: bookmarks.length
  });
  const outlinesRef = context.register(outlinesDict);

  const itemRefs: PDFRef[] = [];
  const itemDicts: PDFDict[] = [];

  for (let i = 0; i < bookmarks.length; i++) {
    const bm = bookmarks[i];
    const safePageIndex = Math.max(0, Math.min(bm.pageIndex, pages.length - 1));
    const targetPage = pages[safePageIndex];
    const pageRef = targetPage.ref;

    // Destination: [pageRef, /Fit] (fit page in window upon clicking)
    const destArray = context.obj([pageRef, PDFName.of('Fit')]);

    const itemDict = context.obj({
      Title: createUtf16PdfString(bm.title),
      Parent: outlinesRef,
      Dest: destArray
    });

    const itemRef = context.register(itemDict);
    itemRefs.push(itemRef);
    itemDicts.push(itemDict);
  }

  // Link outline siblings (Prev / Next)
  for (let i = 0; i < itemDicts.length; i++) {
    if (i > 0) {
      itemDicts[i].set(PDFName.of('Prev'), itemRefs[i - 1]);
    }
    if (i < itemDicts.length - 1) {
      itemDicts[i].set(PDFName.of('Next'), itemRefs[i + 1]);
    }
  }

  outlinesDict.set(PDFName.of('First'), itemRefs[0]);
  outlinesDict.set(PDFName.of('Last'), itemRefs[itemRefs.length - 1]);

  catalog.set(PDFName.of('Outlines'), outlinesRef);
}
