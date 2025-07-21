"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";

interface ImageItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  img: HTMLImageElement;
}

interface TransformControlsProps {
  selectedImageData: ImageItem | null;
  updateImageTransform: (id: string, updates: Partial<Pick<ImageItem, "scale" | "rotation">>) => void;
  resetImageTransform: (id: string) => void;
}

const TransformControls: React.FC<TransformControlsProps> = ({
  selectedImageData,
  updateImageTransform,
  resetImageTransform,
}) => {
  const [localScale, setLocalScale] = useState(1);
  const [localRotation, setLocalRotation] = useState(0);

  // Update local state when selected image changes
  useEffect(() => {
    if (selectedImageData) {
      setLocalScale(selectedImageData.scale);
      setLocalRotation(selectedImageData.rotation);
    }
  }, [selectedImageData]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (id: string, updates: Partial<Pick<ImageItem, "scale" | "rotation">>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          updateImageTransform(id, updates);
        }, 50); // 50ms debounce
      };
    })(),
    [updateImageTransform]
  );

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setLocalScale(newScale);

    if (selectedImageData) {
      debouncedUpdate(selectedImageData.id, { scale: newScale });
    }
  };

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRotation = parseFloat(e.target.value);
    setLocalRotation(newRotation);

    if (selectedImageData) {
      debouncedUpdate(selectedImageData.id, { rotation: newRotation });
    }
  };

  if (!selectedImageData) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Transform Controls</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scale: {localScale.toFixed(2)}x</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.05"
            value={localScale}
            onChange={handleScaleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1x</span>
            <span>3x</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rotation: {Math.round(localRotation)}°</label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={localRotation}
            onChange={handleRotationChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0°</span>
            <span>360°</span>
          </div>
        </div>

        <button
          onClick={() => resetImageTransform(selectedImageData.id)}
          className="w-full flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Transform
        </button>
      </div>
    </div>
  );
};

export default TransformControls;
