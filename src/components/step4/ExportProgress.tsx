import React from 'react';
import type { ProgressCallbackData } from '../../services/zipExporter';

interface ExportProgressProps {
  progress: ProgressCallbackData | null;
  onCancel?: () => void;
}

export const ExportProgress: React.FC<ExportProgressProps> = ({ progress }) => {
  if (!progress) return null;

  const percent =
    progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : 0;

  const phaseLabel =
    progress.phase === 'splitting'
      ? 'PDFを分割しています...'
      : progress.phase === 'zipping'
      ? 'ZIPファイルを作成しています...'
      : '完了しました！';

  return (
    <div className="progress-modal-backdrop" role="dialog" aria-modal="true">
      <div className="progress-modal-card card">
        <div className="progress-header">
          <div className="spinner" />
          <h3>{phaseLabel}</h3>
        </div>

        <div className="progress-body">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="progress-stats">
            <span>
              {progress.current} / {progress.total} 件
            </span>
            <span className="percent-text">{percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
