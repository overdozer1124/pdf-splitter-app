import React from 'react';

interface FixedPageConfigProps {
  pagesPerGroup: number;
  onChangePagesPerGroup: (val: number) => void;
  totalPages: number;
}

export const FixedPageConfig: React.FC<FixedPageConfigProps> = ({
  pagesPerGroup,
  onChangePagesPerGroup,
  totalPages
}) => {
  return (
    <div className="config-box">
      <label htmlFor="pages-per-group-input" className="form-label">
        分割単位 (ページ数)
      </label>
      <div className="input-group inline">
        <input
          id="pages-per-group-input"
          type="number"
          min={1}
          max={totalPages}
          value={pagesPerGroup}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val > 0) {
              onChangePagesPerGroup(val);
            }
          }}
          className="form-input number-input"
        />
        <span className="input-unit">ページごと</span>
      </div>
      <p className="form-help">
        例: 2ページ指定の場合、1-2, 3-4, 5-6 ... に分割します。（最終グループは端数でも許可されます）
      </p>
    </div>
  );
};
