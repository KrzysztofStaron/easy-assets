"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, RotateCcw, Download, Sparkles, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from "lucide-react";
import generate from "./action/generate";

interface ImageItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  img: HTMLImageElement;
}

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  imageId: string | null;
}

const Home = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    imageId: null,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = { width: 800, height: 600 };

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
        ctx.drawImage(image.img, image.x, image.y, image.width, image.height);

        // Draw border for dragged image
        if (draggedImage === image.id) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.strokeRect(image.x, image.y, image.width, image.height);
        }
      }
    });
  }, [images, draggedImage]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
    };

    if (contextMenu.visible) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenu.visible]);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const maxSize = 200;
          let width = maxSize;
          let height = maxSize;

          if (aspectRatio > 1) {
            height = maxSize / aspectRatio;
          } else {
            width = maxSize * aspectRatio;
          }

          const newImage: ImageItem = {
            id: Math.random().toString(36).substr(2, 9),
            src: reader.result as string,
            x: Math.random() * (canvasSize.width - width),
            y: Math.random() * (canvasSize.height - height),
            width,
            height,
            img,
          };

          setImages(prev => [...prev, newImage]);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  });

  const getImageAtPosition = (x: number, y: number): ImageItem | null => {
    // Check from top to bottom (reverse order since last drawn is on top)
    for (let i = images.length - 1; i >= 0; i--) {
      const image = images[i];
      if (x >= image.x && x <= image.x + image.width && y >= image.y && y <= image.y + image.height) {
        return image;
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

    const clickedImage = getImageAtPosition(x, y);
    if (clickedImage) {
      setIsDragging(true);
      setDraggedImage(clickedImage.id);
      setDragOffset({
        x: x - clickedImage.x,
        y: y - clickedImage.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setImages(prev =>
      prev.map(img =>
        img.id === draggedImage
          ? {
              ...img,
              x: Math.max(0, Math.min(x - dragOffset.x, canvasSize.width - img.width)),
              y: Math.max(0, Math.min(y - dragOffset.y, canvasSize.height - img.height)),
            }
          : img
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedImage(null);
    setDragOffset({ x: 0, y: 0 });
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

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const moveToFront = (id: string) => {
    setImages(prev => {
      const imageIndex = prev.findIndex(img => img.id === id);
      if (imageIndex === -1 || imageIndex === prev.length - 1) return prev;

      const image = prev[imageIndex];
      const newImages = [...prev];
      newImages.splice(imageIndex, 1);
      newImages.push(image);
      return newImages;
    });
    setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
  };

  const moveToBack = (id: string) => {
    setImages(prev => {
      const imageIndex = prev.findIndex(img => img.id === id);
      if (imageIndex === -1 || imageIndex === 0) return prev;

      const image = prev[imageIndex];
      const newImages = [...prev];
      newImages.splice(imageIndex, 1);
      newImages.unshift(image);
      return newImages;
    });
    setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
  };

  const moveForward = (id: string) => {
    setImages(prev => {
      const imageIndex = prev.findIndex(img => img.id === id);
      if (imageIndex === -1 || imageIndex === prev.length - 1) return prev;

      const newImages = [...prev];
      [newImages[imageIndex], newImages[imageIndex + 1]] = [newImages[imageIndex + 1], newImages[imageIndex]];
      return newImages;
    });
    setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
  };

  const moveBackward = (id: string) => {
    setImages(prev => {
      const imageIndex = prev.findIndex(img => img.id === id);
      if (imageIndex === -1 || imageIndex === 0) return prev;

      const newImages = [...prev];
      [newImages[imageIndex], newImages[imageIndex - 1]] = [newImages[imageIndex - 1], newImages[imageIndex]];
      return newImages;
    });
    setContextMenu({ visible: false, x: 0, y: 0, imageId: null });
  };

  const clearCanvas = () => {
    setImages([]);
    setEnhancedResult(null);
    setError(null);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "collage.png";
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const enhanceCollage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    setIsEnhancing(true);
    setError(null);
    setEnhancedResult(null);

    try {
      // Get the canvas as a data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // Enhanced prompt for professional asset creation
      const prompt =
        "Transform this collage into a professional, high-quality digital asset with enhanced colors, perfect lighting, crisp details, and polished composition. Make it look like a premium marketing material with vibrant colors and studio-quality finish.";

      const result = await generate(dataUrl, prompt);
      setEnhancedResult(result);
    } catch (err) {
      console.error("Enhancement error:", err);
      setError(err instanceof Error ? err.message : "Failed to enhance collage");
    } finally {
      setIsEnhancing(false);
    }
  };

  const downloadEnhanced = () => {
    if (!enhancedResult) return;

    const link = document.createElement("a");
    link.download = "enhanced-collage.jpg";
    link.href = enhancedResult;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Powered Collage Creator</h1>
          <p className="text-gray-600">Create collages and enhance them with AI for professional results</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Images</h2>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the images here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Drag & drop images here, or click to select</p>
                    <p className="text-sm text-gray-400">Supports JPG, PNG, GIF, WebP</p>
                  </div>
                )}
              </div>
            </div>

            {/* Image List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Images ({images.length})</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {images.map((image, index) => (
                  <div key={image.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <img src={image.src} alt="Thumbnail" className="w-10 h-10 object-cover rounded" />
                    <span className="text-sm text-gray-600 flex-1 ml-2 truncate">
                      Layer {images.length - index} • {image.id.slice(0, 6)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveForward(image.id)}
                        disabled={index === images.length - 1}
                        className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-30"
                        title="Move forward"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => moveBackward(image.id)}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 p-1 disabled:opacity-30"
                        title="Move backward"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
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

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={enhanceCollage}
                  disabled={images.length === 0 || isEnhancing}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4" />
                  {isEnhancing ? "Enhancing..." : "AI Enhance"}
                </button>
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
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  Download Original
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3 relative">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Canvas</h2>
              <p className="text-sm text-gray-600 mb-4">
                Click and drag to move images. Double-click to remove. Right-click for layer options.
              </p>
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
                      onClick={() => moveToFront(contextMenu.imageId!)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <ArrowUp className="h-4 w-4" />
                      Bring to Front
                    </button>
                    <button
                      onClick={() => moveForward(contextMenu.imageId!)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <ChevronUp className="h-4 w-4" />
                      Bring Forward
                    </button>
                    <button
                      onClick={() => moveBackward(contextMenu.imageId!)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Send Backward
                    </button>
                    <button
                      onClick={() => moveToBack(contextMenu.imageId!)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <ArrowDown className="h-4 w-4" />
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
                      <X className="h-4 w-4" />
                      Delete Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isEnhancing && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="text-gray-600">AI is enhancing your collage...</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Enhancement Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Result */}
            {enhancedResult && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">AI Enhanced Result</h2>
                  <button
                    onClick={downloadEnhanced}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Enhanced
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img src={enhancedResult} alt="AI Enhanced Collage" className="w-full h-auto" />
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Your collage has been transformed into a professional-quality asset using AI!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Upload Images</h3>
                <p>Drag and drop or click to select multiple images</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Arrange & Layer</h3>
                <p>Drag images to position them. Right-click for layer options</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-800">AI Enhance</h3>
                <p>Click "AI Enhance" to transform into professional asset</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Download</h3>
                <p>Save your original or enhanced high-quality result</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
