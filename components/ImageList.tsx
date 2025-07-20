"use client";

import React from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";

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

interface ImageListProps {
  images: ImageItem[];
  selectedImage: string | null;
  setSelectedImage: (id: string) => void;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;
  removeImage: (id: string) => void;
}

const ImageList: React.FC<ImageListProps> = ({
  images,
  selectedImage,
  setSelectedImage,
  moveForward,
  moveBackward,
  removeImage,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Images ({images.length})</h2>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
              selectedImage === image.id ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
            }`}
            onClick={() => setSelectedImage(image.id)}
          >
            <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 flex-shrink-0">
              <img
                src={image.src}
                alt="Thumbnail"
                className="w-full h-full object-cover"
                onError={e => {
                  // Fallback to a placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.parentElement!.innerHTML =
                    '<div class="w-full h-full bg-gray-300 flex items-center justify-center"><span class="text-xs text-gray-500">IMG</span></div>';
                }}
              />
            </div>
            <span className="text-sm text-gray-600 flex-1 ml-2 truncate">
              Layer {images.length - index} • {image.id.slice(0, 6)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={e => {
                  e.stopPropagation();
                  moveForward(image.id);
                }}
                disabled={index === images.length - 1}
                className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-30"
                title="Move forward"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  moveBackward(image.id);
                }}
                disabled={index === 0}
                className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-30"
                title="Move backward"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
                className="text-red-500 hover:text-red-700 p-1"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && <p className="text-gray-400 text-center py-4">No images uploaded</p>}
      </div>
    </div>
  );
};

export default ImageList;
