"use client";

import React from "react";
import { RotateCcw, Download } from "lucide-react";

interface ActionsProps {
  images: ImageItem[];
  clearCanvas: () => void;
  downloadCanvas: () => void;
}

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

const Actions: React.FC<ActionsProps> = ({ images, clearCanvas, downloadCanvas }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
      <div className="space-y-3">
        <button
          onClick={clearCanvas}
          disabled={images.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" />
          Clear Canvas
        </button>
        <button
          onClick={downloadCanvas}
          disabled={images.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Download Original
        </button>
      </div>
    </div>
  );
};

export default Actions;
