import React from 'react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="privacy-notice" role="region" aria-label="プライバシー保護声明">
      <div className="privacy-icon">🛡️</div>
      <div className="privacy-text">
        <strong>安心・安全設計：</strong>
        このアプリではPDFや名簿データを外部サーバーへ送信しません。すべてお使いの端末内で処理されます。
      </div>
    </div>
  );
};
