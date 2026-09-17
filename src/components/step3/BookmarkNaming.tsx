import React from 'react';

interface BookmarkNamingProps {
  bookmarks: Array<{ title: string; page: number }>;
  previewNames: string[];
  isExtracting: boolean;
}

export const BookmarkNaming: React.FC<BookmarkNamingProps> = ({
  bookmarks,
  previewNames,
  isExtracting
}) => {
  return (
    <div className="naming-panel">
      <h3>PDFしおり (目次) 命名</h3>
      <p className="help-text">
        元のPDFに設定されているしおり（目次）の情報を読み取り、各分割ファイルの開始ページに最も近いしおりのタイトルをファイル名として自動適用します。
      </p>

      {isExtracting ? (
        <div className="loading-state">
          <p>しおりを抽出中...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="alert warning">
          <p>⚠️ このPDFにはしおりが設定されていないか、読み取れませんでした。別の命名方法を選択してください。</p>
        </div>
      ) : (
        <div className="bookmark-status">
          <p>✅ <strong>{bookmarks.length}件</strong> のしおりが見つかりました。</p>
          <div className="name-preview-list margin-top">
            <h4>出力ファイル名 プレビュー</h4>
            <ul>
              {previewNames.slice(0, 5).map((name, idx) => (
                <li key={idx}>
                  <span className="file-icon">📄</span>
                  {name}
                </li>
              ))}
              {previewNames.length > 5 && (
                <li className="more-items">...他 {previewNames.length - 5} 件</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
