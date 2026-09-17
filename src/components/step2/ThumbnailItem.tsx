import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { renderThumbnailCanvas } from '../../services/pdfReader';

interface ThumbnailItemProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  pageIndex: number; // 0-based
  groupOrder: number;
  groupColorIndex: number;
}

export const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  pdfDoc,
  pageIndex,
  groupOrder,
  groupColorIndex
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  // Lazy Rendering via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Pre-load 200px before scrolling into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Render canvas once visible
  useEffect(() => {
    if (isVisible && pdfDoc && canvasRef.current && !isRendered) {
      renderThumbnailCanvas(pdfDoc, pageIndex, canvasRef.current, 180).then(() => {
        setIsRendered(true);
      });
    }
  }, [isVisible, pdfDoc, pageIndex, isRendered]);

  const colorClass = `group-color-${(groupColorIndex % 5) + 1}`;

  return (
    <div
      ref={containerRef}
      className={`thumbnail-card ${colorClass}`}
      data-page={pageIndex + 1}
    >
      <div className="thumbnail-wrapper">
        <canvas ref={canvasRef} className="thumbnail-canvas" />
        {!isRendered && <div className="thumbnail-placeholder">P.{pageIndex + 1} 読込中...</div>}
      </div>

      <div className="thumbnail-footer">
        <span className="page-number-badge">P. {pageIndex + 1}</span>
        <span className="group-tag">PDF #{groupOrder}</span>
      </div>
    </div>
  );
};
