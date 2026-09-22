import React, { useState } from 'react';
import type { OrganizePageItem } from '../../types/organize';
import { PageCard } from './PageCard';

interface OrganizeGridProps {
  pages: OrganizePageItem[];
  selectedPageIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onRotateCW: (id: string) => void;
  onRotateCCW: (id: string) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onDeletePage: (id: string) => void;
}

export const OrganizeGrid: React.FC<OrganizeGridProps> = ({
  pages,
  selectedPageIds,
  onToggleSelect,
  onRotateCW,
  onRotateCCW,
  onMovePage,
  onDeletePage
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set transparent image or drag data if needed
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    onMovePage(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  return (
    <div className="organize-grid">
      {pages.map((page, index) => (
        <PageCard
          key={page.id}
          page={page}
          currentIndex={index}
          totalCount={pages.length}
          isSelected={selectedPageIds.has(page.id)}
          onToggleSelect={onToggleSelect}
          onRotateCW={onRotateCW}
          onRotateCCW={onRotateCCW}
          onMoveLeft={(fromIdx) => onMovePage(fromIdx, fromIdx - 1)}
          onMoveRight={(fromIdx) => onMovePage(fromIdx, fromIdx + 1)}
          onDelete={onDeletePage}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};
