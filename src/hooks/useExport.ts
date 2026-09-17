import { useState } from 'react';
import type { SourcePdf, SplitGroup } from '../types/pdf';
import { exportPdfZip, type ProgressCallbackData } from '../services/zipExporter';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ProgressCallbackData | null>(null);

  const startExport = async (
    sourcePdf: SourcePdf | null,
    groups: SplitGroup[],
    finalNames: string[]
  ) => {
    if (!sourcePdf || groups.length === 0) return;

    setIsExporting(true);
    setProgress({ phase: 'splitting', current: 0, total: groups.length });

    try {
      // Map final sanitized names into groups
      const groupsWithFinalNames = groups.map((g, idx) => ({
        ...g,
        fileName: finalNames[idx] || g.fileName
      }));

      const zipBlob = await exportPdfZip(
        sourcePdf.arrayBuffer,
        groupsWithFinalNames,
        (p) => setProgress(p)
      );

      // Create download link
      const baseName = sourcePdf.name.replace(/\.pdf$/i, '');
      const zipFilename = `${baseName}_分割.zip`;

      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = zipFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke Object URL to prevent memory leaks
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (err: any) {
      alert(`ZIP出力中にエラーが発生しました: ${err?.message || '不明なエラー'}`);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  return {
    isExporting,
    progress,
    startExport
  };
}
