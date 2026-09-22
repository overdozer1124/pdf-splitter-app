import React from 'react';
import type { OrganizePageItem } from '../../types/organize';

interface PageCardProps {
  page: OrganizePageItem;
  currentIndex: number;
  totalCount: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRotateCW: (id: string) => void;
  onRotateCCW: (id: string) => void;
  onMoveLeft: (fromIdx: number) => void;
  onMoveRight: (fromIdx: number) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetIndex: number) => void;
}

export const PageCard: React.FC<PageCardProps> = ({
  page,
  currentIndex,
  totalCount,
  isSelected,
  onToggleSelect,
  onRotateCW,
  onRotateCCW,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCount - 1;

  return (
    <div
      className={`page-card card ${isSelected ? 'page-card-selected' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, currentIndex)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, currentIndex)}
    >
      {/* Header: Page number badge & Checkbox */}
      <div className="page-card-header">
        <label className="page-select-checkbox-label" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(page.id)}
            className="page-checkbox"
          />
          <span className="page-number-badge">{currentIndex + 1}</span>
        </label>
        <button
          type="button"
          className="btn-icon btn-icon-danger btn-icon-small"
          onClick={() => onDelete(page.id)}
          title="このページを削除"
          aria-label="このページを削除"
        >
          🗑️
        </button>
      </div>

      {/* Thumbnail Viewport */}
      <div className="page-card-thumb-container">
        {page.thumbnailUrl ? (
          <div
            className="page-card-thumb-wrapper"
            style={{
              transform: `rotate(${page.rotation}deg)`
            }}
          >
            <img
              src={page.thumbnailUrl}
              alt={`Page ${currentIndex + 1}`}
              className="page-card-thumb-img"
            />
          </div>
        ) : (
          <div className="thumb-placeholder">P.{currentIndex + 1}</div>
        )}
      </div>

      {/* Meta Info */}
      <div className="page-card-info" title={`${page.sourceFileName} (元P.${page.sourcePageIndex + 1})`}>
        <span className="source-info-text">
          {page.sourceFileName} - P.{page.sourcePageIndex + 1}
        </span>
        {page.rotation !== 0 && (
          <span className="rotation-tag">{page.rotation}°</span>
        )}
      </div>

      {/* Control Buttons */}
      <div className="page-card-controls">
        <div className="control-group-rotate">
          <button
            type="button"
            className="btn-icon btn-icon-small"
            onClick={() => onRotateCCW(page.id)}
            title="左に90°回転"
            aria-label="左に90°回転"
          >
            ↺
          </button>
          <button
            type="button"
            className="btn-icon btn-icon-small"
            onClick={() => onRotateCW(page.id)}
            title="右に90°回転"
            aria-label="右に90°回転"
          >
            ↻
          </button>
        </div>

        <div className="control-group-move">
          <button
            type="button"
            className="btn-icon btn-icon-small"
            disabled={isFirst}
            onClick={() => onMoveLeft(currentIndex)}
            title="前へ移動"
            aria-label="前へ移動"
          >
            ◀
          </button>
          <button
            type="button"
            className="btn-icon btn-icon-small"
            disabled={isLast}
            onClick={() => onMoveRight(currentIndex)}
            title="次へ移動"
            aria-label="次へ移動"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};
