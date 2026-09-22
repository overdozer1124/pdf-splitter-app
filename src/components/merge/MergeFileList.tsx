import React from 'react';
import type { MergePdfItem } from '../../types/merge';

interface MergeFileListProps {
  items: MergePdfItem[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (id: string) => void;
}

export const MergeFileList: React.FC<MergeFileListProps> = ({
  items,
  onMoveUp,
  onMoveDown,
  onRemove
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="merge-file-list">
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="merge-file-card card">
            <div className="merge-file-order">{index + 1}</div>

            {/* Thumbnail */}
            <div className="merge-file-thumb">
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.name} />
              ) : (
                <div className="thumb-placeholder">PDF</div>
              )}
            </div>

            {/* File Info */}
            <div className="merge-file-info">
              <div className="merge-file-name" title={item.name}>
                {item.name}
              </div>
              <div className="merge-file-meta">
                <span className="badge badge-primary">{item.pageCount} ページ</span>
                <span className="file-size-tag">{formatFileSize(item.size)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="merge-file-actions">
              <button
                type="button"
                className="btn-icon"
                disabled={isFirst}
                onClick={() => onMoveUp(index)}
                title="上へ移動"
                aria-label="上へ移動"
              >
                ▲
              </button>
              <button
                type="button"
                className="btn-icon"
                disabled={isLast}
                onClick={() => onMoveDown(index)}
                title="下へ移動"
                aria-label="下へ移動"
              >
                ▼
              </button>
              <button
                type="button"
                className="btn-icon btn-icon-danger"
                onClick={() => onRemove(item.id)}
                title="削除"
                aria-label="削除"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
