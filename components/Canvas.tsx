"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { Sparkles } from "lucide-react";

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

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  imageId: string | null;
}

interface TransformHandle {
  type: "scale" | "rotate";
  x: number;
  y: number;
  size: number;
}

interface CanvasProps {
  images: ImageItem[];
  selectedImage: string | null;
  setSelectedImage: (id: string | null) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  draggedImage: string | null;
  setDraggedImage: (id: string | null) => void;
  dragOffset: { x: number; y: number };
  setDragOffset: (offset: { x: number; y: number }) => void;
  transformMode: "move" | "scale" | "rotate";
  setTransformMode: (mode: "move" | "scale" | "rotate") => void;
  initialTransform: { scale: number; rotation: number };
  setInitialTransform: (transform: { scale: number; rotation: number }) => void;
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  canvasSize: { width: number; height: number };
  contextMenu: ContextMenu;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu>>;
  removeImage: (id: string) => void;
  resetImageTransform: (id: string) => void;
  moveToFront: (id: string) => void;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;
  moveToBack: (id: string) => void;
  enhancementPrompt: string;
  setEnhancementPrompt: (prompt: string) => void;
  enhanceCollage: () => void;
  isEnhancing: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  images,
  selectedImage,
  setSelectedImage,
  isDragging,
  setIsDragging,
  draggedImage,
  setDraggedImage,
  dragOffset,
  setDragOffset,
  transformMode,
  setTransformMode,
  initialTransform,
  setInitialTransform,
  setImages,
  canvasSize,
  contextMenu,
  setContextMenu,
  removeImage,
  resetImageTransform,
  moveToFront,
  moveForward,
  moveBackward,
  moveToBack,
  enhancementPrompt,
  setEnhancementPrompt,
  enhanceCollage,
  isEnhancing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialDistanceRef = useRef<number>(0);

  const getTransformHandles = (image: ImageItem): TransformHandle[] => {
    const centerX = image.x + (image.width * image.scale) / 2;
    const centerY = image.y + (image.height * image.scale) / 2;
    const handleSize = 8;
    const rotateHandleDistance = 30;

    return [
      // Scale handles (corners)
      {
        type: "scale",
        x: image.x + image.width * image.scale - handleSize / 2,
        y: image.y + image.height * image.scale - handleSize / 2,
        size: handleSize,
      },
      // Rotation handle (top center, extended)
      {
        type: "rotate",
        x: centerX - handleSize / 2,
        y: image.y - rotateHandleDistance,
        size: handleSize,
      },
    ];
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all images
    images.forEach(image => {
      if (image.img && image.img.complete) {
        ctx.save();

        // Move to image center for rotation
        const centerX = image.x + (image.width * image.scale) / 2;
        const centerY = image.y + (image.height * image.scale) / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate((image.rotation * Math.PI) / 180);
        ctx.scale(image.scale, image.scale);

        // Draw image centered
        ctx.drawImage(image.img, -image.width / 2, -image.height / 2, image.width, image.height);

        ctx.restore();

        // Draw selection and transform handles
        if (selectedImage === image.id) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);

          // Draw selection box
          ctx.strokeRect(image.x, image.y, image.width * image.scale, image.height * image.scale);

          ctx.setLineDash([]);

          // Draw transform handles
          const handles = getTransformHandles(image);
          handles.forEach(handle => {
            ctx.fillStyle = handle.type === "scale" ? "#3b82f6" : "#10b981";
            ctx.fillRect(handle.x, handle.y, handle.size, handle.size);

            // Add white border
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.strokeRect(handle.x, handle.y, handle.size, handle.size);
          });

          // Draw rotation line
          const rotateHandle = handles.find(h => h.type === "rotate");
          if (rotateHandle) {
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(image.x + (image.width * image.scale) / 2, image.y);
            ctx.lineTo(rotateHandle.x + rotateHandle.size / 2, rotateHandle.y + rotateHandle.size / 2);
            ctx.stroke();
          }
        }
      }
    });
  }, [images, selectedImage]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getImageAtPosition = (x: number, y: number): ImageItem | null => {
    // Check from top to bottom (reverse order since last drawn is on top)
    for (let i = images.length - 1; i >= 0; i--) {
      const image = images[i];
      if (
        x >= image.x &&
        x <= image.x + image.width * image.scale &&
        y >= image.y &&
        y <= image.y + image.height * image.scale
      ) {
        return image;
      }
    }
    return null;
  };

  const getHandleAtPosition = (x: number, y: number, imageId: string): TransformHandle | null => {
    const image = images.find(img => img.id === imageId);
    if (!image) return null;

    const handles = getTransformHandles(image);
    for (const handle of handles) {
      if (x >= handle.x && x <= handle.x + handle.size && y >= handle.y && y <= handle.y + handle.size) {
        return handle;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only handle left mouse button

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a handle first
    if (selectedImage) {
      const handle = getHandleAtPosition(x, y, selectedImage);
      if (handle) {
        setTransformMode(handle.type);
        setIsDragging(true);
        setDraggedImage(selectedImage);

        const image = images.find(img => img.id === selectedImage);
        if (image) {
          setInitialTransform({ scale: image.scale, rotation: image.rotation });

          // For scaling, calculate initial distance from center to mouse position
          if (handle.type === "scale") {
            const centerX = image.x + (image.width * image.scale) / 2;
            const centerY = image.y + (image.height * image.scale) / 2;
            initialDistanceRef.current = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          }

          setDragOffset({ x, y });
        }
        return;
      }
    }

    // Check if clicking on an image
    const clickedImage = getImageAtPosition(x, y);
    if (clickedImage) {
      setSelectedImage(clickedImage.id);
      setIsDragging(true);
      setDraggedImage(clickedImage.id);
      setTransformMode("move");
      setDragOffset({
        x: x - clickedImage.x,
        y: y - clickedImage.y,
      });
    } else {
      // Clicked on empty area, deselect
      setSelectedImage(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp coordinates to canvas bounds to prevent scaling issues
    const clampedX = Math.max(0, Math.min(x, canvas.width));
    const clampedY = Math.max(0, Math.min(y, canvas.height));

    const image = images.find(img => img.id === draggedImage);
    if (!image) return;

    setImages(prev =>
      prev.map(img => {
        if (img.id !== draggedImage) return img;

        switch (transformMode) {
          case "move":
            return {
              ...img,
              x: Math.max(0, Math.min(x - dragOffset.x, canvasSize.width - img.width * img.scale)),
              y: Math.max(0, Math.min(y - dragOffset.y, canvasSize.height - img.height * img.scale)),
            };

          case "scale":
            const centerX = img.x + (img.width * img.scale) / 2;
            const centerY = img.y + (img.height * img.scale) / 2;
            const currentDistance = Math.sqrt(Math.pow(clampedX - centerX, 2) + Math.pow(clampedY - centerY, 2));

            // Use the initial distance reference for stable scaling
            const scaleMultiplier = currentDistance / initialDistanceRef.current;
            const newScale = Math.max(0.1, Math.min(3, initialTransform.scale * scaleMultiplier));

            return {
              ...img,
              scale: newScale,
            };

          case "rotate":
            const imageCenterX = img.x + (img.width * img.scale) / 2;
            const imageCenterY = img.y + (img.height * img.scale) / 2;
            const angle = Math.atan2(clampedY - imageCenterY, clampedX - imageCenterX);
            const degrees = (angle * 180) / Math.PI + 90; // +90 to make top = 0 degrees

            return {
              ...img,
              rotation: degrees,
            };

          default:
            return img;
        }
      })
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedImage(null);
    setTransformMode("move");
    setDragOffset({ x: 0, y: 0 });
    initialDistanceRef.current = 0;
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedImage = getImageAtPosition(x, y);
    if (clickedImage) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        imageId: clickedImage.id,
      });
    } else {
      setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedImage = getImageAtPosition(x, y);
    if (clickedImage) {
      removeImage(clickedImage.id);
    }
  };

  return (
    <div className="lg:col-span-3 relative">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Canvas</h2>
            <p className="text-sm text-gray-600">
              Click to select. Drag to move. Use corner handle to scale, top handle to rotate. Right-click for options.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="Custom enhancement prompt (optional)"
                value={enhancementPrompt}
                onChange={e => setEnhancementPrompt(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isEnhancing}
              />
            </div>
            <button
              onClick={enhanceCollage}
              disabled={images.length === 0 || isEnhancing}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              {isEnhancing ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="block cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
          />

          {/* Context Menu */}
          {contextMenu.visible && (
            <div
              className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
              }}
            >
              <button
                onClick={() => {
                  resetImageTransform(contextMenu.imageId!);
                  setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Transform
              </button>
              <hr className="my-1" />
              <button
                onClick={() => moveToFront(contextMenu.imageId!)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Bring to Front
              </button>
              <button
                onClick={() => moveForward(contextMenu.imageId!)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Bring Forward
              </button>
              <button
                onClick={() => moveBackward(contextMenu.imageId!)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Send Backward
              </button>
              <button
                onClick={() => moveToBack(contextMenu.imageId!)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Send to Back
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  removeImage(contextMenu.imageId!);
                  setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Delete Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
