import React from 'react';

export type AppToolMode = 'split' | 'merge' | 'organize';

interface AppNavProps {
  activeMode: AppToolMode;
  onSelectMode: (mode: AppToolMode) => void;
}

export const AppNav: React.FC<AppNavProps> = ({ activeMode, onSelectMode }) => {
  const tools = [
    {
      id: 'split' as AppToolMode,
      icon: '✂️',
      title: '分割・一括命名',
      desc: '1ページ/範囲/目次で分割＆名簿命名'
    },
    {
      id: 'merge' as AppToolMode,
      icon: '🔗',
      title: 'PDF結合',
      desc: '複数のPDFを1つに統合'
    },
    {
      id: 'organize' as AppToolMode,
      icon: '🔄',
      title: 'ページ整理・回転',
      desc: '並び替え・回転・ページ削除'
    }
  ];

  return (
    <nav className="app-nav-tabs" aria-label="Tool switcher">
      {tools.map((tool) => {
        const isActive = activeMode === tool.id;
        return (
          <button
            key={tool.id}
            type="button"
            className={`app-nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => onSelectMode(tool.id)}
          >
            <span className="nav-tab-icon">{tool.icon}</span>
            <div className="nav-tab-text">
              <span className="nav-tab-title">{tool.title}</span>
              <span className="nav-tab-desc">{tool.desc}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
