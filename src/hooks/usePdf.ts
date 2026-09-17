import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { SourcePdf } from '../types/pdf';
import { loadPdfDocument } from '../services/pdfReader';

export function usePdf() {
  const [sourcePdf, setSourcePdf] = useState<SourcePdf | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('PDF形式のファイル (.pdf) を選択してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const meta = await loadPdfDocument(arrayBuffer.slice(0));

      setSourcePdf({
        name: file.name,
        size: file.size,
        pageCount: meta.pageCount,
        arrayBuffer: arrayBuffer.slice(0)
      });
      setPdfDocProxy(meta.doc);
    } catch (err: any) {
      setError(err?.message || 'PDFの読み込みに失敗しました。');
      setSourcePdf(null);
      setPdfDocProxy(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearPdf = () => {
    setSourcePdf(null);
    setPdfDocProxy(null);
    setError(null);
  };

  return {
    sourcePdf,
    pdfDocProxy,
    isLoading,
    error,
    handleSelectFile,
    clearPdf
  };
}
