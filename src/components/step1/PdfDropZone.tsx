import React, { useRef, useState } from 'react';

interface PdfDropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export const PdfDropZone: React.FC<PdfDropZoneProps> = ({
  onFileSelect,
  isLoading,
  error
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="pdf-dropzone-container">
      <div
        className={`dropzone ${isDragOver ? 'drag-over' : ''} ${
          isLoading ? 'loading' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="PDFファイルをドラッグ＆ドロップまたは選択"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {isLoading ? (
          <div className="dropzone-loading">
            <div className="spinner" />
            <p>PDFを解析中...</p>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="dropzone-icon">📄</div>
            <h3>PDFファイルをここにドロップ</h3>
            <p className="dropzone-sub">またはファイルを選択</p>
            <button
              type="button"
              className="btn btn-primary btn-large"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              PDFファイルを選択
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
