import React from 'react';

interface RangeConfigProps {
  rangeString: string;
  onChangeRangeString: (val: string) => void;
  error?: string;
  totalPages: number;
}

export const RangeConfig: React.FC<RangeConfigProps> = ({
  rangeString,
  onChangeRangeString,
  error,
  totalPages
}) => {
  return (
    <div className="config-box">
      <label htmlFor="range-input" className="form-label">
        分割範囲の指定
      </label>
      <input
        id="range-input"
        type="text"
        placeholder="例: 1-3, 4-7, 8, 9-12"
        value={rangeString}
        onChange={(e) => onChangeRangeString(e.target.value)}
        className={`form-input text-input ${error ? 'is-invalid' : ''}`}
      />
      {error ? (
        <p className="form-error">{error}</p>
      ) : (
        <p className="form-help">
          カンマ区切りでページ範囲を指定できます（1～{totalPages}ページ）。ハイフン「-」で範囲、数字単体で1ページ指定となります。
        </p>
      )}
    </div>
  );
};
