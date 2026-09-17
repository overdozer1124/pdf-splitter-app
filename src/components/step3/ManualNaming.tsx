import React from 'react';
import type { SplitGroup } from '../../types/pdf';

interface ManualNamingProps {
  groups: SplitGroup[];
  names: string[];
  onChangeName: (index: number, newName: string) => void;
}

export const ManualNaming: React.FC<ManualNamingProps> = ({
  groups,
  names,
  onChangeName
}) => {
  return (
    <div className="manual-naming-container card">
      <h3 className="section-title">個別ファイル名入力</h3>
      <p className="section-desc">
        各分割PDFに割り当てるファイル名を入力してください。拡張子 (.pdf) は自動付与されます。
      </p>

      <div className="manual-list-table">
        <div className="table-header">
          <div className="col-num">No.</div>
          <div className="col-page">対象ページ</div>
          <div className="col-filename">ファイル名</div>
        </div>

        <div className="table-body">
          {groups.map((group, idx) => (
            <div key={group.id} className="table-row">
              <div className="col-num">#{group.order}</div>
              <div className="col-page">
                {group.startPage === group.endPage
                  ? `P.${group.startPage}`
                  : `P.${group.startPage}～${group.endPage}`}
              </div>
              <div className="col-filename">
                <input
                  type="text"
                  className="form-input text-input"
                  value={names[idx] || ''}
                  onChange={(e) => onChangeName(idx, e.target.value)}
                  placeholder={`例: ${group.order}_氏名`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
