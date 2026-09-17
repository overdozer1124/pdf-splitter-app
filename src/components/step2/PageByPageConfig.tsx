import React from 'react';

export const PageByPageConfig: React.FC<{ totalPages: number }> = ({ totalPages }) => {
  return (
    <div className="config-banner info">
      <span>💡 すべてのページ（全{totalPages}ページ）を1ページずつ単体PDFへ分割します。</span>
    </div>
  );
};
