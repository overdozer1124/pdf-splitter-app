import React, { useRef, useState } from 'react';

interface OrganizeDropZoneProps {
  onFilesSelect: (files: FileList | File[]) => void;
  isLoading?: boolean;
  hasFiles?: boolean;
}

export const OrganizeDropZone: React.FC<OrganizeDropZoneProps> = ({
  onFilesSelect,
  isLoading = false,
  hasFiles = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onFilesSelect(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(e.target.files);
    }
  };

  return (
    <div
      className={`dropzone card ${isDragOver ? 'drag-over' : ''} ${hasFiles ? 'dropzone-compact' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="application/pdf,.pdf"
        multiple
        style={{ display: 'none' }}
      />
      <div className="dropzone-content">
        <div className="dropzone-icon">🔄</div>
        <h3 className="dropzone-title">
          {hasFiles ? '別のPDFを追加してページを差し込む' : '整理・回転したいPDFを選択またはドロップ'}
        </h3>
        <p className="dropzone-desc">
          ページの並び替え、回転、不要ページの削除を視覚的に行えます
        </p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {isLoading ? '読み込み中...' : 'PDFファイルを選択'}
        </button>
      </div>
    </div>
  );
};
