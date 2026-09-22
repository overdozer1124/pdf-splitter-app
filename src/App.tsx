import React, { useState } from 'react';
import { PrivacyNotice } from './components/common/PrivacyNotice';
import { AppNav, type AppToolMode } from './components/common/AppNav';
import { SplitView } from './components/split/SplitView';
import { MergeView } from './components/merge/MergeView';
import { OrganizeView } from './components/organize/OrganizeView';

export const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<AppToolMode>('split');

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          <span>🛠️</span> オフライン PDF ツールボックス
        </h1>
        <p className="app-subtitle">
          分割・結合・ページの並び替え・回転・一括命名が完全無料で使えるブラウザ完結ツール
        </p>
      </header>

      {/* Privacy Notice Banner */}
      <PrivacyNotice />

      {/* Tool Navigation Tabs */}
      <AppNav activeMode={activeTool} onSelectMode={setActiveTool} />

      {/* Main Tool Content Area */}
      <main className="main-content">
        {activeTool === 'split' && <SplitView />}
        {activeTool === 'merge' && <MergeView />}
        {activeTool === 'organize' && <OrganizeView />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>オフライン PDF ツールボックス v2.0 • 100% Client-Side • 完全無料・個人情報保護</p>
      </footer>
    </div>
  );
};

export default App;
