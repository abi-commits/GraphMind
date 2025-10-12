import { useState } from 'react';

export const useDragAndDrop = (onFilesDropped: (files: File[]) => void) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onFilesDropped(files);
  };

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};