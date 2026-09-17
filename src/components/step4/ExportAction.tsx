import React from 'react';

interface ExportActionProps {
  canExport: boolean;
  onExportZip: () => void;
  onPrevStep: () => void;
  onReset: () => void;
}

export const ExportAction: React.FC<ExportActionProps> = ({
  canExport,
  onExportZip,
  onPrevStep,
  onReset
}) => {
  return (
    <div className="export-action-bar card">
      <div className="action-left">
        <button type="button" className="btn btn-secondary" onClick={onPrevStep}>
          ◀ ファイル名設定に戻る
        </button>
        <button type="button" className="btn btn-outline-danger" onClick={onReset}>
          最初からやり直す
        </button>
      </div>

      <div className="action-right">
        <button
          type="button"
          className="btn btn-success btn-xlarge"
          disabled={!canExport}
          onClick={onExportZip}
        >
          📦 分割PDFをZIP保存
        </button>
      </div>
    </div>
  );
};
