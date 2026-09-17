import React, { useRef } from 'react';
import type { SpreadsheetData, SpreadsheetRow } from '../../types/spreadsheet';
import type { SpreadsheetNamingConfig } from '../../types/naming';
import { TemplateBuilder } from './TemplateBuilder';
import { RowOrderManager } from './RowOrderManager';

interface SpreadsheetNamingProps {
  data: SpreadsheetData | null;
  onImportFile: (file: File, encoding?: string) => void;
  config: SpreadsheetNamingConfig;
  onChangeConfig: (newConfig: SpreadsheetNamingConfig) => void;
  onSelectSheet: (sheetName: string) => void;
  onChangeHeaderRowIndex: (idx: number) => void;
  onReorderRows: (newRows: SpreadsheetRow[]) => void;
  previewNames: string[];
}

export const SpreadsheetNaming: React.FC<SpreadsheetNamingProps> = ({
  data,
  onImportFile,
  config,
  onChangeConfig,
  onSelectSheet,
  onChangeHeaderRowIndex,
  onReorderRows,
  previewNames
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportFile(e.dataTransfer.files[0]);
    }
  };

  const handleMoveRow = (fromIdx: number, toIdx: number) => {
    if (!data) return;
    const newRows = [...data.rows];
    const [moved] = newRows.splice(fromIdx, 1);
    newRows.splice(toIdx, 0, moved);
    onReorderRows(newRows);
  };

  return (
    <div className="spreadsheet-naming-container card">
      <h3 className="section-title">Excel / CSV 名簿から読み込む</h3>

      {!data ? (
        <div
          className="dropzone spreadsheet-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onImportFile(e.target.files[0]);
              }
            }}
          />
          <div className="dropzone-icon">📊</div>
          <h3>Excel (.xlsx, .xls) または CSV ファイルをドロップ</h3>
          <p className="dropzone-sub">名簿ファイルも端末内のみで解析されます</p>
          <button type="button" className="btn btn-secondary">
            ファイルを選択
          </button>
        </div>
      ) : (
        <div className="spreadsheet-config-body">
          {/* File summary & Encoding */}
          <div className="spreadsheet-meta-bar">
            <span className="file-chip">📊 読込済 ({data.rows.length}行)</span>

            <div className="sheet-selector-group">
              <label htmlFor="sheet-select" className="inline-label">
                シート:
              </label>
              <select
                id="sheet-select"
                className="form-select select-sm"
                value={data.currentSheet}
                onChange={(e) => onSelectSheet(e.target.value)}
              >
                {data.sheets.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="header-row-selector">
              <label htmlFor="header-row-select" className="inline-label">
                見出し行:
              </label>
              <select
                id="header-row-select"
                className="form-select select-sm"
                value={config.headerRowIndex}
                onChange={(e) => onChangeHeaderRowIndex(parseInt(e.target.value, 10))}
              >
                <option value={0}>1行目</option>
                <option value={1}>2行目</option>
                <option value={2}>3行目</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              別の名簿を選択
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onImportFile(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Mode Switch: Column vs Template */}
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`toggle-btn ${config.mode === 'column' ? 'active' : ''}`}
              onClick={() => onChangeConfig({ ...config, mode: 'column' })}
            >
              単一列指定
            </button>
            <button
              type="button"
              className={`toggle-btn ${config.mode === 'template' ? 'active' : ''}`}
              onClick={() => onChangeConfig({ ...config, mode: 'template' })}
            >
              テンプレート指定 (複数列結合)
            </button>
          </div>

          {/* Config Details */}
          {config.mode === 'column' ? (
            <div className="config-box">
              <label htmlFor="column-select" className="form-label">
                ファイル名として使用する列
              </label>
              <select
                id="column-select"
                className="form-select"
                value={config.selectedColumn}
                onChange={(e) =>
                  onChangeConfig({ ...config, selectedColumn: e.target.value })
                }
              >
                {data.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <TemplateBuilder
              template={config.template}
              onChangeTemplate={(t) => onChangeConfig({ ...config, template: t })}
              headers={data.headers}
              zeroPadColumns={config.zeroPadColumns}
              onChangeZeroPadColumn={(col, digits) =>
                onChangeConfig({
                  ...config,
                  zeroPadColumns: { ...config.zeroPadColumns, [col]: digits }
                })
              }
            />
          )}

          {/* Row Order Reorder */}
          <RowOrderManager
            rows={data.rows}
            onMoveRow={handleMoveRow}
            previewNames={previewNames}
          />
        </div>
      )}
    </div>
  );
};
