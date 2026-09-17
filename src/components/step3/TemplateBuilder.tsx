import React, { useRef } from 'react';

interface TemplateBuilderProps {
  template: string;
  onChangeTemplate: (val: string) => void;
  headers: string[];
  zeroPadColumns: Record<string, number>;
  onChangeZeroPadColumn: (colName: string, digits: number) => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  template,
  onChangeTemplate,
  headers,
  zeroPadColumns,
  onChangeZeroPadColumn
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertToken = (colName: string) => {
    const token = `{${colName}}`;
    if (!inputRef.current) {
      onChangeTemplate(template + token);
      return;
    }

    const input = inputRef.current;
    const start = input.selectionStart || template.length;
    const end = input.selectionEnd || template.length;

    const newText = template.substring(0, start) + token + template.substring(end);
    onChangeTemplate(newText);

    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  };

  return (
    <div className="template-builder-box card-inner">
      <div className="form-group">
        <label htmlFor="template-input" className="form-label">
          命名テンプレート
        </label>
        <input
          ref={inputRef}
          id="template-input"
          type="text"
          className="form-input text-input"
          value={template}
          onChange={(e) => onChangeTemplate(e.target.value)}
          placeholder="例: {学年}年_{組}組_{出席番号}_{氏名}"
        />
        <p className="form-help">
          列名をクリックすると、テンプレート内に変数を挿入できます。
        </p>
      </div>

      <div className="token-buttons-container">
        <span className="token-label">利用可能な列名:</span>
        <div className="token-chips">
          {headers.map((h) => (
            <button
              key={h}
              type="button"
              className="chip-btn"
              onClick={() => insertToken(h)}
            >
              + [{h}]
            </button>
          ))}
        </div>
      </div>

      <div className="zeropad-settings">
        <span className="zeropad-title">数値列のゼロ埋め設定:</span>
        <div className="zeropad-grid">
          {headers.map((h) => {
            const digits = zeroPadColumns[h] || 1;
            return (
              <div key={h} className="zeropad-item">
                <span className="col-name">[{h}]</span>
                <select
                  className="form-select select-sm"
                  value={digits}
                  onChange={(e) =>
                    onChangeZeroPadColumn(h, parseInt(e.target.value, 10) || 1)
                  }
                >
                  <option value={1}>そのまま</option>
                  <option value={2}>2桁 (01, 02)</option>
                  <option value={3}>3桁 (001, 002)</option>
                  <option value={4}>4桁 (0001, 0002)</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
