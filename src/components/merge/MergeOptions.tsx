import React from 'react';
import type { MergeOptions, MergeGroupOutput, MergeBatchMode } from '../../types/merge';

interface MergeOptionsProps {
  options: MergeOptions;
  onChangeOptions: (newOptions: MergeOptions) => void;
  groups: MergeGroupOutput[];
  totalFiles: number;
  totalPages: number;
}

export const MergeOptionsPanel: React.FC<MergeOptionsProps> = ({
  options,
  onChangeOptions,
  groups,
  totalFiles,
  totalPages
}) => {
  const handleBatchModeChange = (mode: MergeBatchMode) => {
    onChangeOptions({ ...options, batchMode: mode });
  };

  const handleBookmarkToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeOptions({ ...options, addBookmarks: e.target.checked });
  };

  const handleFilesPerGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChangeOptions({ ...options, filesPerGroup: isNaN(val) || val < 1 ? 1 : val });
  };

  const handlePagesPerGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChangeOptions({ ...options, maxPagesPerGroup: isNaN(val) || val < 1 ? 1 : val });
  };

  return (
    <div className="merge-options-panel card-inner margin-top">
      <h4 className="options-panel-title">⚙️ 結合・しおり設定</h4>

      {/* Bookmark setting */}
      <div className="option-row">
        <label className="checkbox-label-styled">
          <input
            type="checkbox"
            checked={options.addBookmarks}
            onChange={handleBookmarkToggle}
            className="styled-checkbox"
          />
          <div className="checkbox-text">
            <span className="checkbox-title">📑 各PDFのファイル名から「しおり（目次）」を自動作成</span>
            <span className="checkbox-desc">
              結合後のPDFリーダーで、各ファイルの先頭ページへワンクリックでジャンプできるようになります
            </span>
          </div>
        </label>
      </div>

      {/* Batch Mode setting */}
      <div className="option-row margin-top-sm">
        <div className="option-label-header">
          <span className="option-heading">📦 結合単位の指定:</span>
        </div>

        <div className="batch-mode-grid">
          {/* Option A: All in one */}
          <label
            className={`batch-mode-card ${options.batchMode === 'all' ? 'active' : ''}`}
            onClick={() => handleBatchModeChange('all')}
          >
            <div className="batch-card-header">
              <input
                type="radio"
                name="batchMode"
                checked={options.batchMode === 'all'}
                onChange={() => handleBatchModeChange('all')}
              />
              <span className="batch-card-title">すべて1つに結合</span>
            </div>
            <p className="batch-card-desc">
              全{totalFiles}ファイルを1つのPDFドキュメントとしてまとめます。
            </p>
          </label>

          {/* Option B: By File Count */}
          <label
            className={`batch-mode-card ${options.batchMode === 'byFileCount' ? 'active' : ''}`}
            onClick={() => handleBatchModeChange('byFileCount')}
          >
            <div className="batch-card-header">
              <input
                type="radio"
                name="batchMode"
                checked={options.batchMode === 'byFileCount'}
                onChange={() => handleBatchModeChange('byFileCount')}
              />
              <span className="batch-card-title">指定ファイル数ごと</span>
            </div>
            <div className="batch-input-inline" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                min="1"
                max={Math.max(1, totalFiles)}
                value={options.filesPerGroup}
                onChange={handleFilesPerGroupChange}
                className="input-number-compact"
              />
              <span className="unit-label">ファイルずつ結合</span>
            </div>
            <p className="batch-card-desc">
              {options.filesPerGroup}ファイルごとに分割結合して出力します。
            </p>
          </label>

          {/* Option C: By Page Count */}
          <label
            className={`batch-mode-card ${options.batchMode === 'byPageCount' ? 'active' : ''}`}
            onClick={() => handleBatchModeChange('byPageCount')}
          >
            <div className="batch-card-header">
              <input
                type="radio"
                name="batchMode"
                checked={options.batchMode === 'byPageCount'}
                onChange={() => handleBatchModeChange('byPageCount')}
              />
              <span className="batch-card-title">指定ページ数ごと</span>
            </div>
            <div className="batch-input-inline" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                min="1"
                max={Math.max(1, totalPages)}
                value={options.maxPagesPerGroup}
                onChange={handlePagesPerGroupChange}
                className="input-number-compact"
              />
              <span className="unit-label">ページ以内ごとに結合</span>
            </div>
            <p className="batch-card-desc">
              合計が約{options.maxPagesPerGroup}ページ以内になるよう順次結合します。
            </p>
          </label>
        </div>
      </div>

      {/* Summary of output */}
      <div className="groups-summary-bar">
        <span className="summary-icon">ℹ️</span>
        <span className="summary-text">
          出力予定: <strong>{groups.length} 個のPDFファイル</strong>
          {groups.length > 1
            ? '（ZIPファイルにまとめて一括ダウンロード）'
            : '（単一PDFダウンロード）'}
        </span>
      </div>
    </div>
  );
};
