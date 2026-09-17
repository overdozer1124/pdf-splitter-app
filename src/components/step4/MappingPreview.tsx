import React, { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { SplitGroup } from '../../types/pdf';
import { renderThumbnailCanvas } from '../../services/pdfReader';

interface MappingPreviewProps {
  groups: SplitGroup[];
  names: string[];
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
}

const MiniThumbnail: React.FC<{
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  pageIndex: number;
}> = ({ pdfDoc, pageIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderThumbnailCanvas(pdfDoc, pageIndex, canvasRef.current, 60);
    }
  }, [pdfDoc, pageIndex]);

  return <canvas ref={canvasRef} className="mini-thumb-canvas" />;
};

export const MappingPreview: React.FC<MappingPreviewProps> = ({
  groups,
  names,
  pdfDoc
}) => {
  return (
    <div className="mapping-preview-container card">
      <h3 className="section-title">PDFとファイル名の最終対応表</h3>
      <p className="section-desc">
        保存前に、各分割PDFと割り当てられたファイル名の対応をご確認ください。
      </p>

      <div className="mapping-table-wrapper">
        <table className="mapping-table">
          <thead>
            <tr>
              <th className="th-num">No.</th>
              <th className="th-thumb">先頭ページ</th>
              <th className="th-pages">対象ページ</th>
              <th className="th-name">保存ファイル名</th>
              <th className="th-status">状態</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, idx) => {
              const fileName = names[idx] || group.fileName;
              const hasName = Boolean(fileName);

              return (
                <tr key={group.id}>
                  <td className="td-num">#{group.order}</td>
                  <td className="td-thumb">
                    <MiniThumbnail pdfDoc={pdfDoc} pageIndex={group.pageIndices[0]} />
                  </td>
                  <td className="td-pages">
                    {group.startPage === group.endPage
                      ? `P.${group.startPage}`
                      : `P.${group.startPage}～${group.endPage}`}
                  </td>
                  <td className="td-name">
                    <span className="file-name-highlight">{fileName}</span>
                  </td>
                  <td className="td-status">
                    {hasName ? (
                      <span className="status-badge success">✓ OK</span>
                    ) : (
                      <span className="status-badge danger">⚠️ 空欄</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
