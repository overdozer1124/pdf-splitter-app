import { useState, useCallback, useRef } from 'react';
import type { OrganizePageItem, OrganizeFileItem, OrganizeProgress } from '../types/organize';
import { loadPdfDocument, renderPageToDataUrl } from '../services/pdfReader';
import { exportOrganizedPdf } from '../services/pdfOrganizer';

export function useOrganize() {
  const [files, setFiles] = useState<Map<string, OrganizeFileItem>>(new Map());
  const [pages, setPages] = useState<OrganizePageItem[]>([]);
  const [initialPages, setInitialPages] = useState<OrganizePageItem[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<OrganizeProgress | null>(null);
  const [outputFileName, setOutputFileName] = useState('organized.pdf');
  const [error, setError] = useState<string | null>(null);

  const fileBuffersRef = useRef<Map<string, ArrayBuffer>>(new Map());

  // Add PDF file(s)
  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    setIsLoading(true);
    setError(null);

    const fileArray = Array.from(newFiles).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (fileArray.length === 0) {
      setError('PDFファイルを選択してください。');
      setIsLoading(false);
      return;
    }

    try {
      const newPagesList: OrganizePageItem[] = [];
      const newFilesMap = new Map(files);

      for (const file of fileArray) {
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const arrayBuffer = await file.arrayBuffer();
        const { doc, pageCount } = await loadPdfDocument(arrayBuffer);

        fileBuffersRef.current.set(fileId, arrayBuffer);

        const fileItem: OrganizeFileItem = {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          arrayBuffer
        };
        newFilesMap.set(fileId, fileItem);

        // Generate thumbnails for all pages of this file
        for (let pIdx = 0; pIdx < pageCount; pIdx++) {
          const pageItem: OrganizePageItem = {
            id: `p_${fileId}_${pIdx}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            fileId,
            sourceFileName: file.name,
            sourcePageIndex: pIdx,
            rotation: 0
          };

          // Render thumbnail asynchronously
          try {
            const dataUrl = await renderPageToDataUrl(doc, pIdx, 200);
            pageItem.thumbnailUrl = dataUrl;
          } catch (e) {
            // ignore
          }

          newPagesList.push(pageItem);
        }
      }

      setFiles(newFilesMap);
      setPages((prev) => {
        const updated = [...prev, ...newPagesList];
        if (prev.length === 0 && fileArray.length > 0) {
          const baseName = fileArray[0].name.replace(/\.[^/.]+$/, '');
          setOutputFileName(`編集済み_${baseName}.pdf`);
          setInitialPages(updated);
        }
        return updated;
      });
    } catch (err: any) {
      setError(err?.message || 'PDFの読み込み中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  // Rotate a single page (+90 or -90 degrees)
  const rotatePage = useCallback((pageId: string, direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : -90;
    setPages((prev) =>
      prev.map((page) => {
        if (page.id !== pageId) return page;
        const newRot = (page.rotation + delta + 360) % 360;
        return { ...page, rotation: newRot };
      })
    );
  }, []);

  // Rotate all pages
  const rotateAllPages = useCallback((delta: number) => {
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        rotation: (page.rotation + delta + 360) % 360
      }))
    );
  }, []);

  // Rotate selected pages
  const rotateSelectedPages = useCallback((delta: number) => {
    setPages((prev) =>
      prev.map((page) => {
        if (!selectedPageIds.has(page.id)) return page;
        return {
          ...page,
          rotation: (page.rotation + delta + 360) % 360
        };
      })
    );
  }, [selectedPageIds]);

  // Delete a single page
  const deletePage = useCallback((pageId: string) => {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      next.delete(pageId);
      return next;
    });
  }, []);

  // Delete selected pages
  const deleteSelectedPages = useCallback(() => {
    setPages((prev) => prev.filter((p) => !selectedPageIds.has(p.id)));
    setSelectedPageIds(new Set());
  }, [selectedPageIds]);

  // Move a page in the array
  const movePage = useCallback((fromIndex: number, toIndex: number) => {
    setPages((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  // Selection helpers
  const toggleSelectPage = useCallback((pageId: string) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  }, []);

  const selectAllPages = useCallback(() => {
    setSelectedPageIds(new Set(pages.map((p) => p.id)));
  }, [pages]);

  const clearSelection = useCallback(() => {
    setSelectedPageIds(new Set());
  }, []);

  const selectOddPages = useCallback(() => {
    const oddIds = pages.filter((_, idx) => idx % 2 === 0).map((p) => p.id);
    setSelectedPageIds(new Set(oddIds));
  }, [pages]);

  const selectEvenPages = useCallback(() => {
    const evenIds = pages.filter((_, idx) => idx % 2 === 1).map((p) => p.id);
    setSelectedPageIds(new Set(evenIds));
  }, [pages]);

  // Reset to initial state
  const resetPages = useCallback(() => {
    setPages(initialPages);
    setSelectedPageIds(new Set());
  }, [initialPages]);

  // Clear all
  const clearAll = useCallback(() => {
    setFiles(new Map());
    setPages([]);
    setInitialPages([]);
    setSelectedPageIds(new Set());
    setError(null);
    fileBuffersRef.current.clear();
  }, []);

  // Start export
  const startExport = useCallback(async () => {
    if (pages.length === 0) {
      setError('ページが0件です。');
      return;
    }

    setIsExporting(true);
    setProgress({ current: 0, total: pages.length, status: 'エクスポート準備中...' });
    setError(null);

    try {
      const blob = await exportOrganizedPdf(pages, fileBuffersRef.current, (p) => setProgress(p));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || 'PDFのエクスポート中にエラーが発生しました。');
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  }, [pages, outputFileName]);

  return {
    files,
    pages,
    selectedPageIds,
    isLoading,
    isExporting,
    progress,
    outputFileName,
    setOutputFileName,
    error,
    addFiles,
    rotatePage,
    rotateAllPages,
    rotateSelectedPages,
    deletePage,
    deleteSelectedPages,
    movePage,
    toggleSelectPage,
    selectAllPages,
    clearSelection,
    selectOddPages,
    selectEvenPages,
    resetPages,
    clearAll,
    startExport
  };
}
