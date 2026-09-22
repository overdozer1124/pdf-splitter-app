import React from 'react';
import { OrganizeDropZone } from './OrganizeDropZone';
import { OrganizeToolbar } from './OrganizeToolbar';
import { OrganizeGrid } from './OrganizeGrid';
import { useOrganize } from '../../hooks/useOrganize';

export const OrganizeView: React.FC = () => {
  const {
    files,
    pages,
    selectedPageIds,
    isLoading,
    isExporting,
    progress,
    outputFileName,
    setOutputFileName,
    error,
    addFiles,
    rotatePage,
    rotateAllPages,
    rotateSelectedPages,
    deletePage,
    deleteSelectedPages,
    movePage,
    toggleSelectPage,
    selectAllPages,
    clearSelection,
    selectOddPages,
    selectEvenPages,
    resetPages,
    clearAll,
    startExport
  } = useOrganize();

  return (
    <div className="organize-view-container">
      {/* Header Card */}
      <div className="card section-card">
        <h2 className="section-title">🔄 ページの整理・回転・削除 (Organize)</h2>
        <p className="section-desc">
          ページの並び順の入れ替え、回転（向きの修正）、不要ページの削除を視覚的に行い、新しいPDFとして保存します。
        </p>

        {error && <div className="validation-error-box">{error}</div>}

        {/* Drop Zone */}
        <OrganizeDropZone
          onFilesSelect={addFiles}
          isLoading={isLoading}
          hasFiles={pages.length > 0}
        />
      </div>

      {/* Grid & Operations Area */}
      {pages.length > 0 && (
        <div className="card section-card margin-top">
          <div className="section-header-flex">
            <h3 className="card-subtitle">
              ページ一覧 ({pages.length} ページ / {files.size} ファイル)
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={clearAll}
            >
              全クリア
            </button>
          </div>

          <p className="helper-text">
            各カードの ↺ / ↻ で回転、◀ / ▶ やドラッグ＆ドロップで並び替え、🗑️ で削除できます。
          </p>

          {/* Toolbar */}
          <OrganizeToolbar
            totalCount={pages.length}
            selectedCount={selectedPageIds.size}
            onRotateAllCW={() => rotateAllPages(90)}
            onRotateAllCCW={() => rotateAllPages(-90)}
            onRotateSelectedCW={() => rotateSelectedPages(90)}
            onRotateSelectedCCW={() => rotateSelectedPages(-90)}
            onDeleteSelected={deleteSelectedPages}
            onSelectAll={selectAllPages}
            onClearSelection={clearSelection}
            onSelectOdd={selectOddPages}
            onSelectEven={selectEvenPages}
            onReset={resetPages}
          />

          {/* Page Cards Grid */}
          <OrganizeGrid
            pages={pages}
            selectedPageIds={selectedPageIds}
            onToggleSelect={toggleSelectPage}
            onRotateCW={(id) => rotatePage(id, 'cw')}
            onRotateCCW={(id) => rotatePage(id, 'ccw')}
            onMovePage={movePage}
            onDeletePage={deletePage}
          />

          {/* Export / Settings Bar */}
          <div className="organize-export-bar card margin-top">
            <div className="output-name-input-group">
              <label htmlFor="organize-output-name" className="form-label">
                出力ファイル名:
              </label>
              <input
                id="organize-output-name"
                type="text"
                className="input-text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="organized.pdf"
              />
            </div>

            <div className="organize-action-buttons">
              <button
                type="button"
                className="btn btn-primary btn-large"
                disabled={pages.length === 0 || isExporting}
                onClick={startExport}
              >
                {isExporting
                  ? progress?.status || '保存中...'
                  : `編集済みPDFを保存・ダウンロード (${pages.length} ページ)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Progress Overlay */}
      {isExporting && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="spinner"></div>
            <h3 className="modal-title">PDFを生成中...</h3>
            <p className="modal-desc">{progress?.status || '処理中です'}</p>
            {progress && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.round((progress.current / progress.total) * 100)}%`
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
