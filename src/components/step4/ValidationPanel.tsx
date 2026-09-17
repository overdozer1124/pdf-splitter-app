import React from 'react';
import type { ValidationError } from '../../types/validation';

interface ValidationPanelProps {
  splitCount: number;
  nameCount: number;
  errors: ValidationError[];
  autoSequenceDuplicates: boolean;
  onToggleAutoSequenceDuplicates: (val: boolean) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  splitCount,
  nameCount,
  errors,
  autoSequenceDuplicates,
  onToggleAutoSequenceDuplicates
}) => {
  const isCountMatch = splitCount > 0 && splitCount === nameCount;
  const hasErrors = errors.length > 0;

  return (
    <div className="validation-panel card">
      <h3 className="section-title">データ整合性チェック</h3>

      <div className="validation-status-grid">
        <div className={`status-card ${isCountMatch ? 'success' : 'danger'}`}>
          <div className="status-header">
            <span className="status-icon">{isCountMatch ? '✓' : '⚠️'}</span>
            <span className="status-label">件数チェック</span>
          </div>
          <div className="status-detail">
            PDF分割数: <strong>{splitCount}</strong> 件 / ファイル名数:{' '}
            <strong>{nameCount}</strong> 件
          </div>
          {!isCountMatch && (
            <p className="status-warning-text">
              ⚠️ PDFの数とファイル名の数が一致していません。Step 2 または Step 3 で件数を調整してください。
            </p>
          )}
        </div>

        <div className={`status-card ${!hasErrors ? 'success' : 'warning'}`}>
          <div className="status-header">
            <span className="status-icon">{!hasErrors ? '✓' : '⚡'}</span>
            <span className="status-label">ファイル名検証</span>
          </div>
          <div className="status-detail">
            {!hasErrors
              ? 'すべてのファイル名が正しく設定されています。'
              : `${errors.length} 件の注意事項・エラーがあります。`}
          </div>
        </div>
      </div>

      {hasErrors && (
        <div className="error-list-container">
          {errors.map((err, idx) => (
            <div key={idx} className="error-item-alert">
              <span className="alert-icon">⚠️</span>
              <span className="alert-message">{err.message}</span>
            </div>
          ))}

          {errors.some((e) => e.type === 'DUPLICATE_NAME') && (
            <div className="auto-resolve-box">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoSequenceDuplicates}
                  onChange={(e) => onToggleAutoSequenceDuplicates(e.target.checked)}
                />
                <span>重複したファイル名に自動的に連番 (_2, _3) を付与して保存を許可する</span>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
