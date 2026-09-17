import React from 'react';
import type { SplitGroup } from '../../types/pdf';

interface SplitSummaryProps {
  groups: SplitGroup[];
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const SplitSummary: React.FC<SplitSummaryProps> = ({
  groups,
  onNextStep,
  onPrevStep
}) => {
  return (
    <div className="split-summary-bar card sticky-bottom">
      <div className="summary-info">
        <span className="summary-badge">分割結果</span>
        <span className="summary-count">
          計 <strong>{groups.length}</strong> 個のPDFに分割されます
        </span>
      </div>

      <div className="summary-tags-preview">
        {groups.slice(0, 6).map((g) => (
          <span key={g.id} className="group-range-chip">
            #{g.order} ({g.startPage === g.endPage ? `P.${g.startPage}` : `P.${g.startPage}～${g.endPage}`})
          </span>
        ))}
        {groups.length > 6 && (
          <span className="group-range-more">他 {groups.length - 6} 件</span>
        )}
      </div>

      <div className="summary-actions">
        <button type="button" className="btn btn-secondary" onClick={onPrevStep}>
          ◀ PDF読込に戻る
        </button>
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={onNextStep}
          disabled={groups.length === 0}
        >
          ファイル名を設定する (Step 3) ➔
        </button>
      </div>
    </div>
  );
};
