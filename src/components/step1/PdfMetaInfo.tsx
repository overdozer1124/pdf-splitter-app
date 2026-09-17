import React from 'react';
import type { SourcePdf } from '../../types/pdf';

interface PdfMetaInfoProps {
  pdf: SourcePdf;
  onChangePdf: () => void;
  onNextStep: () => void;
}

export const PdfMetaInfo: React.FC<PdfMetaInfoProps> = ({
  pdf,
  onChangePdf,
  onNextStep
}) => {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="pdf-meta-card card">
      <div className="pdf-meta-header">
        <div className="pdf-badge-icon">📄</div>
        <div className="pdf-meta-details">
          <h2 className="pdf-filename">{pdf.name}</h2>
          <div className="pdf-stats">
            <span className="stat-item">
              <strong>{pdf.pageCount}</strong> ページ
            </span>
            <span className="stat-separator">•</span>
            <span className="stat-item">{formatSize(pdf.size)}</span>
          </div>
        </div>
      </div>

      <div className="pdf-meta-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onChangePdf}
        >
          別のPDFを選択
        </button>
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={onNextStep}
        >
          分割位置を指定する ➔
        </button>
      </div>
    </div>
  );
};
