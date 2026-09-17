import React from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ThumbnailItem } from './ThumbnailItem';
import type { SplitGroup } from '../../types/pdf';

interface ThumbnailGridProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  totalPages: number;
  breakpoints: boolean[];
  onToggleBreakpoint: (index: number) => void;
  groups: SplitGroup[];
}

export const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({
  pdfDoc,
  totalPages,
  breakpoints,
  onToggleBreakpoint,
  groups
}) => {
  // Map page index to group info for color styling
  const pageToGroupMap = new Map<number, { order: number; colorIdx: number }>();
  groups.forEach((g, gIdx) => {
    g.pageIndices.forEach((pIdx) => {
      pageToGroupMap.set(pIdx, { order: g.order, colorIdx: gIdx });
    });
  });

  return (
    <div className="thumbnail-grid-container">
      <div className="thumbnail-instruction-bar">
        <span>✂️ ページの間の「切断」ボタンをクリックすると、そこでPDFが分割されます。</span>
      </div>

      <div className="thumbnail-flex-grid">
        {Array.from({ length: totalPages }).map((_, pageIdx) => {
          const groupInfo = pageToGroupMap.get(pageIdx) || { order: 1, colorIdx: 0 };
          const hasBreak = pageIdx < totalPages - 1 && breakpoints[pageIdx];

          return (
            <React.Fragment key={pageIdx}>
              <ThumbnailItem
                pdfDoc={pdfDoc}
                pageIndex={pageIdx}
                groupOrder={groupInfo.order}
                groupColorIndex={groupInfo.colorIdx}
              />

              {pageIdx < totalPages - 1 && (
                <div className={`split-marker-container ${hasBreak ? 'is-split' : ''}`}>
                  <button
                    type="button"
                    className={`split-marker-btn ${hasBreak ? 'active' : ''}`}
                    onClick={() => onToggleBreakpoint(pageIdx)}
                    title={hasBreak ? '分割を解除' : 'ここでPDFを分割'}
                    aria-label={`ページ ${pageIdx + 1} と ${pageIdx + 2} の目で分割切替`}
                  >
                    <span className="scissor-icon">✂️</span>
                    <span className="split-text">{hasBreak ? '分割中' : '分割'}</span>
                  </button>
                  {hasBreak && <div className="split-divider-line" />}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
