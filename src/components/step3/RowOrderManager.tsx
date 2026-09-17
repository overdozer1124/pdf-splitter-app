import React from 'react';
import type { SpreadsheetRow } from '../../types/spreadsheet';

interface RowOrderManagerProps {
  rows: SpreadsheetRow[];
  onMoveRow: (fromIdx: number, toIdx: number) => void;
  previewNames: string[];
}

export const RowOrderManager: React.FC<RowOrderManagerProps> = ({
  rows,
  onMoveRow,
  previewNames
}) => {
  return (
    <div className="row-order-manager card-inner">
      <div className="row-order-header">
        <h4>名簿順序の変更</h4>
        <span className="help-badge">
          PDFの分割順と名簿の順序を一致させてください（↑/↓で移動）
        </span>
      </div>

      <div className="row-order-list">
        {rows.map((_row, idx) => (
          <div key={idx} className="row-order-item">
            <span className="row-num">#{idx + 1}</span>
            <span className="generated-preview-tag">{previewNames[idx] || '未定'}</span>

            <div className="row-move-buttons">
              <button
                type="button"
                className="btn-icon"
                disabled={idx === 0}
                onClick={() => onMoveRow(idx, idx - 1)}
                title="上へ移動"
              >
                ▲
              </button>
              <button
                type="button"
                className="btn-icon"
                disabled={idx === rows.length - 1}
                onClick={() => onMoveRow(idx, idx + 1)}
                title="下へ移動"
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
