import React from 'react';
import { MergeDropZone } from './MergeDropZone';
import { MergeFileList } from './MergeFileList';
import { MergeOptionsPanel } from './MergeOptions';
import { useMerge } from '../../hooks/useMerge';

export const MergeView: React.FC = () => {
  const {
    items,
    options,
    setOptions,
    mergeGroups,
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
  } = useMerge();

  const totalPages = items.reduce((acc, item) => acc + item.pageCount, 0);

  return (
    <div className="merge-view-container">
      {/* Overview / Header Card */}
      <div className="card section-card">
        <h2 className="section-title">🔗 複数PDFの結合 (Merge)</h2>
        <p className="section-desc">
          複数のPDFファイルを自由な順番で結合します。ファイル名からしおり（目次）を自動作成したり、指定したファイル数やページ数ごとにまとめて結合することも可能です。
        </p>

        {error && <div className="validation-error-box">{error}</div>}

        {/* Drop Zone */}
        <MergeDropZone
          onFilesSelect={addFiles}
          isLoading={isLoading}
          hasFiles={items.length > 0}
        />
      </div>

      {/* File List and Controls */}
      {items.length > 0 && (
        <div className="card section-card margin-top">
          <div className="section-header-flex">
            <h3 className="card-subtitle">
              読み込み済みPDF ({items.length} ファイル / 合計 {totalPages} ページ)
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={clearFiles}
            >
              全クリア
            </button>
          </div>

          <p className="helper-text">
            ▲ / ▼ ボタンを使って、上から結合したい順番に並べ替えてください。
          </p>

          <MergeFileList
            items={items}
            onMoveUp={(idx) => moveFile(idx, idx - 1)}
            onMoveDown={(idx) => moveFile(idx, idx + 1)}
            onRemove={removeFile}
          />

          {/* Merge Options Panel (Bookmarks & Batch Units) */}
          <MergeOptionsPanel
            options={options}
            onChangeOptions={setOptions}
            groups={mergeGroups}
            totalFiles={items.length}
            totalPages={totalPages}
          />

          {/* Export / Settings Bar */}
          <div className="merge-export-bar card margin-top">
            <div className="output-name-input-group">
              <label htmlFor="merge-output-name" className="form-label">
                {mergeGroups.length > 1 ? '基本ファイル名:' : '出力ファイル名:'}
              </label>
              <input
                id="merge-output-name"
                type="text"
                className="input-text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder={mergeGroups.length > 1 ? 'merged' : 'merged.pdf'}
              />
            </div>

            <div className="merge-action-buttons">
              <button
                type="button"
                className="btn btn-primary btn-large"
                disabled={items.length === 0 || isMerging}
                onClick={startMerge}
              >
                {isMerging
                  ? progress?.status || '結合処理中...'
                  : mergeGroups.length > 1
                  ? `${mergeGroups.length} 個のPDFに分割結合してZIP保存`
                  : `1つのPDFに結合して保存 (${totalPages} ページ)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Progress Overlay */}
      {isMerging && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="spinner"></div>
            <h3 className="modal-title">PDFを結合中...</h3>
            <p className="modal-desc">{progress?.status || '処理中です'}</p>
            {progress && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.round((progress.current / Math.max(1, progress.total)) * 100)}%`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
