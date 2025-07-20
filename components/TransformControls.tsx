"use client";

import React from "react";
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
  if (!selectedImageData) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Transform Controls</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scale: {selectedImageData.scale.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={selectedImageData.scale}
            onChange={e => updateImageTransform(selectedImageData.id, { scale: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1x</span>
            <span>3x</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rotation: {Math.round(selectedImageData.rotation)}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={selectedImageData.rotation}
            onChange={e => updateImageTransform(selectedImageData.id, { rotation: parseFloat(e.target.value) })}
            className="w-full"
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
