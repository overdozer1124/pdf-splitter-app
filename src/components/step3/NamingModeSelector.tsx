import React from 'react';
import type { NamingMode } from '../../types/naming';

interface NamingModeSelectorProps {
  currentMode: NamingMode;
  onSelectMode: (mode: NamingMode) => void;
}

const MODES: { id: NamingMode; label: string; description: string; icon: string }[] = [
  {
    id: 'sequence',
    label: '連番命名',
    description: '基本名 + 番号 (例: 個人票_001.pdf)',
    icon: '🔢'
  },
  {
    id: 'manual',
    label: '個別入力',
    description: '分割PDFごとに直接ファイル名を入力',
    icon: '✍️'
  },
  {
    id: 'spreadsheet',
    label: 'Excel / CSV 名簿読込',
    description: '名簿ファイルから自動的に氏名やテンプレートを適用',
    icon: '📊'
  }
];

export const NamingModeSelector: React.FC<NamingModeSelectorProps> = ({
  currentMode,
  onSelectMode
}) => {
  return (
    <div className="naming-mode-selector" role="tablist" aria-label="命名方法選択">
      {MODES.map((m) => {
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            className={`naming-mode-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelectMode(m.id)}
            role="tab"
            aria-selected={isActive}
          >
            <span className="tab-icon">{m.icon}</span>
            <span className="tab-label">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
