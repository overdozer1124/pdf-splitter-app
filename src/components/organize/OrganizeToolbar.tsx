import React from 'react';

interface OrganizeToolbarProps {
  totalCount: number;
  selectedCount: number;
  onRotateAllCW: () => void;
  onRotateAllCCW: () => void;
  onRotateSelectedCW: () => void;
  onRotateSelectedCCW: () => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectOdd: () => void;
  onSelectEven: () => void;
  onReset: () => void;
}

export const OrganizeToolbar: React.FC<OrganizeToolbarProps> = ({
  totalCount,
  selectedCount,
  onRotateAllCW,
  onRotateAllCCW,
  onRotateSelectedCW,
  onRotateSelectedCCW,
  onDeleteSelected,
  onSelectAll,
  onClearSelection,
  onSelectOdd,
  onSelectEven,
  onReset
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className="organize-toolbar card">
      {/* Selection Summary and Filters */}
      <div className="toolbar-section">
        <div className="toolbar-label">
          <span>ページ選択 (全{totalCount}頁):</span>
          {hasSelection && (
            <span className="badge badge-primary">{selectedCount} 件選択中</span>
          )}
        </div>
        <div className="toolbar-btn-group">
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={onSelectAll}
            title="すべてのページを選択"
          >
            全選択
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={onSelectOdd}
            title="奇数ページ（1, 3, 5...）を選択"
          >
            奇数
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={onSelectEven}
            title="偶数ページ（2, 4, 6...）を選択"
          >
            偶数
          </button>
          {hasSelection && (
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={onClearSelection}
            >
              解除
            </button>
          )}
        </div>
      </div>

      {/* Rotation & Action Controls */}
      <div className="toolbar-section">
        <div className="toolbar-label">
          <span>{hasSelection ? '選択ページの一括操作:' : '全ページの一括操作:'}</span>
        </div>
        <div className="toolbar-btn-group">
          {hasSelection ? (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={onRotateSelectedCCW}
                title="選択中のページを左に90°回転"
              >
                ↺ 選択を左回転
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={onRotateSelectedCW}
                title="選択中のページを右に90°回転"
              >
                ↻ 選択を右回転
              </button>
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={onDeleteSelected}
                title="選択中のページを一括削除"
              >
                🗑️ 選択を削除 ({selectedCount})
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={onRotateAllCCW}
                title="すべてのページを左に90°回転"
              >
                ↺ 全体を左90°
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={onRotateAllCW}
                title="すべてのページを右に90°回転"
              >
                ↻ 全体を右90°
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={onReset}
            title="最初の並び順と向きにリセット"
          >
            ↩ リセット
          </button>
        </div>
      </div>
    </div>
  );
};
