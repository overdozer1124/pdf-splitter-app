import React from 'react';
import type { SequenceConfig } from '../../types/naming';

interface SequenceNamingProps {
  config: SequenceConfig;
  onChangeConfig: (newConfig: SequenceConfig) => void;
  previewNames: string[];
}

export const SequenceNaming: React.FC<SequenceNamingProps> = ({
  config,
  onChangeConfig,
  previewNames
}) => {
  return (
    <div className="sequence-naming-container card">
      <h3 className="section-title">連番設定</h3>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="seq-prefix" className="form-label">
            基本名 (プレフィックス)
          </label>
          <input
            id="seq-prefix"
            type="text"
            className="form-input"
            placeholder="例: 個人票, 通知表"
            value={config.prefix}
            onChange={(e) => onChangeConfig({ ...config, prefix: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="seq-start" className="form-label">
            開始番号
          </label>
          <input
            id="seq-start"
            type="number"
            min={0}
            className="form-input"
            value={config.startNumber}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                startNumber: parseInt(e.target.value, 10) || 1
              })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="seq-digits" className="form-label">
            桁数 (ゼロ埋め)
          </label>
          <select
            id="seq-digits"
            className="form-select"
            value={config.digits}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                digits: parseInt(e.target.value, 10) || 1
              })
            }
          >
            <option value={1}>1桁 (1, 2, 3)</option>
            <option value={2}>2桁 (01, 02, 03)</option>
            <option value={3}>3桁 (001, 002, 003)</option>
            <option value={4}>4桁 (0001, 0002, 0003)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="seq-sep" className="form-label">
            区切り文字
          </label>
          <select
            id="seq-sep"
            className="form-select"
            value={config.separator}
            onChange={(e) => onChangeConfig({ ...config, separator: e.target.value })}
          >
            <option value="_">アンダースコア ( _ )</option>
            <option value="-">ハイフン ( - )</option>
            <option value="">なし</option>
          </select>
        </div>
      </div>

      <div className="preview-box">
        <div className="preview-title">リアルタイム生成プレビュー</div>
        <div className="preview-list">
          {previewNames.slice(0, 4).map((name, idx) => (
            <div key={idx} className="preview-item">
              <span className="preview-idx">#{idx + 1}:</span>
              <span className="preview-name">{name}</span>
            </div>
          ))}
          {previewNames.length > 4 && (
            <div className="preview-more">他 {previewNames.length - 4} 件...</div>
          )}
        </div>
      </div>
    </div>
  );
};
