import React from 'react';
import type { SplitMode } from '../../types/pdf';

interface ModeSelectorProps {
  currentMode: SplitMode;
  onSelectMode: (mode: SplitMode) => void;
}

const MODES: { id: SplitMode; label: string; description: string; icon: string }[] = [
  {
    id: 'thumbnail',
    label: 'サムネイルで切断 (推奨)',
    description: 'ページの一覧を見ながら切断位置を直感的にクリック',
    icon: '✂️'
  },
  {
    id: 'single',
    label: '1ページずつ',
    description: '全ページをそれぞれ単体PDFに分割',
    icon: '📄'
  },
  {
    id: 'fixed',
    label: '一定ページ数ごと',
    description: '2ページごと、3ページごと等の均等分割',
    icon: '📚'
  },
  {
    id: 'range',
    label: '範囲指定',
    description: '「1-3, 4-7, 8」のように自由に指定',
    icon: '✏️'
  }
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode
}) => {
  return (
    <div className="mode-selector-grid" role="radiogroup" aria-label="分割モード選択">
      {MODES.map((m) => {
        const isSelected = currentMode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            className={`mode-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectMode(m.id)}
            role="radio"
            aria-checked={isSelected}
          >
            <div className="mode-icon">{m.icon}</div>
            <div className="mode-info">
              <div className="mode-label">{m.label}</div>
              <div className="mode-desc">{m.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
