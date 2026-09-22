import { useState, useCallback } from 'react';
import type { MergePdfItem, MergeProgress } from '../types/merge';
import { loadPdfDocument, renderPageToDataUrl } from '../services/pdfReader';
import { mergePdfs } from '../services/pdfMerger';

export function useMerge() {
  const [items, setItems] = useState<MergePdfItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState<MergeProgress | null>(null);
  const [outputFileName, setOutputFileName] = useState('merged.pdf');
  const [error, setError] = useState<string | null>(null);

  // Add multiple files
  const addFiles = useCallback(async (files: FileList | File[]) => {
    setIsLoading(true);
    setError(null);

    const newItems: MergePdfItem[] = [];
    const fileArray = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (fileArray.length === 0) {
      setError('PDFファイルを選択してください。');
      setIsLoading(false);
      return;
    }

    try {
      for (const file of fileArray) {
        const arrayBuffer = await file.arrayBuffer();
        const { doc, pageCount } = await loadPdfDocument(arrayBuffer);
        const thumbnailUrl = await renderPageToDataUrl(doc, 0, 180);

        newItems.push({
          id: `merge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          arrayBuffer,
          thumbnailUrl
        });
      }

      setItems((prev) => {
        const next = [...prev, ...newItems];
        // Set default output filename based on first file name if not already custom
        if (prev.length === 0 && newItems.length > 0) {
          const baseName = newItems[0].name.replace(/\.[^/.]+$/, '');
          setOutputFileName(`結合_${baseName}.pdf`);
        }
        return next;
      });
    } catch (err: any) {
      setError(err?.message || 'PDFの読み込み中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove single file
  const removeFile = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Move file up/down in list
  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setItems((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setItems([]);
    setError(null);
    setProgress(null);
  }, []);

  // Execute merge and download
  const startMerge = useCallback(async () => {
    if (items.length === 0) return;
    setIsMerging(true);
    setProgress({ current: 0, total: items.length, status: '結合の準備中...' });
    setError(null);

    try {
      const mergedBlob = await mergePdfs(items, (p) => setProgress(p));
      
      // Trigger download
      const url = URL.createObjectURL(mergedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || 'PDFの結合中にエラーが発生しました。');
    } finally {
      setIsMerging(false);
      setProgress(null);
    }
  }, [items, outputFileName]);

  return {
    items,
    isLoading,
    isMerging,
    progress,
    outputFileName,
    setOutputFileName,
    error,
    addFiles,
    removeFile,
    moveFile,
    clearFiles,
    startMerge
  };
}
