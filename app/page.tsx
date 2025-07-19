"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  RotateCcw,
  Download,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Move,
  Maximize,
  Lightbulb,
  Search,
} from "lucide-react";
import generate, { analyzeCollage } from "./action/generate";

interface ImageItem {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number; // in degrees
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

const Home = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [transformMode, setTransformMode] = useState<"move" | "scale" | "rotate">("move");
  const [initialTransform, setInitialTransform] = useState({ scale: 1, rotation: 0 });
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    imageId: null,
  });
  const [enhancementPrompt, setEnhancementPrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [pexelsSearch, setPexelsSearch] = useState("");
  const [isSearchingPexels, setIsSearchingPexels] = useState(false);
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = { width: 800, height: 600 };

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
            scale: 1,
            rotation: 0,
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
            const initialDistance = Math.sqrt(
              Math.pow(dragOffset.x - centerX, 2) + Math.pow(dragOffset.y - centerY, 2)
            );
            const currentDistance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const scaleMultiplier = currentDistance / initialDistance;
            const newScale = Math.max(0.1, Math.min(3, initialTransform.scale * scaleMultiplier));

            return {
              ...img,
              scale: newScale,
            };

          case "rotate":
            const imageCenterX = img.x + (img.width * img.scale) / 2;
            const imageCenterY = img.y + (img.height * img.scale) / 2;
            const angle = Math.atan2(y - imageCenterY, x - imageCenterX);
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

  const updateImageTransform = (id: string, updates: Partial<Pick<ImageItem, "scale" | "rotation">>) => {
    setImages(prev => prev.map(img => (img.id === id ? { ...img, ...updates } : img)));
  };

  const resetImageTransform = (id: string) => {
    updateImageTransform(id, { scale: 1, rotation: 0 });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage === id) {
      setSelectedImage(null);
    }
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
    setSelectedImage(null);
    setEnhancedResult(null);
    setError(null);
    setSuggestions([]);
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

  const applySuggestion = async (suggestion: string) => {
    if (!enhancedResult) {
      setError("Please enhance the collage first before applying suggestions");
      return;
    }

    setIsApplyingSuggestion(true);
    setError(null);

    try {
      const enhancedPrompt = `Apply this specific improvement to the image: "${suggestion}". Make precise adjustments while maintaining the overall quality and composition of the professional asset.`;

      const result = await generate(enhancedResult, enhancedPrompt);
      setEnhancedResult(result);
      setEditPrompt(""); // Clear edit prompt when suggestion is applied
    } catch (err) {
      console.error("Suggestion application error:", err);
      setError(err instanceof Error ? err.message : "Failed to apply suggestion");
    } finally {
      setIsApplyingSuggestion(false);
    }
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

      // Use user's custom prompt or default prompt
      const prompt =
        enhancementPrompt.trim() ||
        "Transform this collage into a professional, high-quality digital asset with enhanced colors, perfect lighting, crisp details, and polished composition. Make it look like a premium marketing material with vibrant colors and studio-quality finish. Many components will be porly pasted by user, so use the collage as a base, if things have a background there is more chance that it is pasted by user, so make sure to use the collage as a base and enhance it.";

      const result = await generate(dataUrl, prompt);
      setEnhancedResult(result);

      // Automatically analyze the enhanced output image for suggestions
      setIsAnalyzing(true);
      try {
        const aiSuggestions = await analyzeCollage(result);
        setSuggestions(aiSuggestions || []);
      } catch (analysisErr) {
        console.error("Auto-analysis error:", analysisErr);
        // Don't set error state for analysis failure, as enhancement succeeded
      } finally {
        setIsAnalyzing(false);
      }
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

  const editGeneratedImage = async () => {
    if (!enhancedResult || !editPrompt.trim()) return;

    setIsEnhancing(true);
    setError(null);

    try {
      const result = await generate(enhancedResult, editPrompt.trim());
      setEnhancedResult(result);
      setEditPrompt(""); // Clear the edit prompt after successful edit
    } catch (err) {
      console.error("Edit error:", err);
      setError(err instanceof Error ? err.message : "Failed to edit image");
    } finally {
      setIsEnhancing(false);
    }
  };

  const searchPexels = async () => {
    if (!pexelsSearch.trim()) return;

    setIsSearchingPexels(true);
    setError(null);

    try {
      const response = await fetch(`/api/pexels?query=${encodeURIComponent(pexelsSearch.trim())}`);
      const data = await response.json();

      if (response.ok) {
        setPexelsResults(data.photos || []);
      } else {
        throw new Error(data.error || "Failed to search Pexels");
      }
    } catch (err) {
      console.error("Pexels search error:", err);
      setError(err instanceof Error ? err.message : "Failed to search Pexels");
    } finally {
      setIsSearchingPexels(false);
    }
  };

  const addPexelsImage = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
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
        src: imageUrl,
        x: Math.random() * (canvasSize.width - width),
        y: Math.random() * (canvasSize.height - height),
        width,
        height,
        scale: 1,
        rotation: 0,
        img,
      };

      setImages(prev => [...prev, newImage]);
      setSelectedImage(newImage.id);
    };
    img.src = imageUrl;
  };

  const selectedImageData = selectedImage ? images.find(img => img.id === selectedImage) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Powered Collage Creator</h1>
          <p className="text-gray-600">
            Create, transform, and enhance collages with AI intelligence and professional results
          </p>
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

            {/* Pexels Search */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Pexels</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="tree, gorilla, T-Rex etc."
                    value={pexelsSearch}
                    onChange={e => setPexelsSearch(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && searchPexels()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isSearchingPexels}
                  />
                  <button
                    onClick={searchPexels}
                    disabled={!pexelsSearch.trim() || isSearchingPexels}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>

                {pexelsResults.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {pexelsResults.map(photo => (
                      <div
                        key={photo.id}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-green-400 transition-colors"
                        onClick={() => addPexelsImage(photo.url)}
                      >
                        <img src={photo.url} alt={photo.alt} className="w-full h-20 object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                          <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity text-center">
                            Click to add
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pexelsResults.length === 0 && isSearchingPexels && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Searching...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transform Controls */}
            {selectedImageData && (
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
                      onChange={e =>
                        updateImageTransform(selectedImageData.id, { rotation: parseFloat(e.target.value) })
                      }
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
            )}

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI Suggestions
                </h2>
                <p className="text-xs text-gray-500 mb-3 italic">Generated automatically after enhancement</p>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(suggestion)}
                      disabled={!enhancedResult || isApplyingSuggestion}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-sm font-medium text-gray-800 mb-1">Suggestion {index + 1}</div>
                      <div className="text-xs text-gray-600">{suggestion}</div>
                    </button>
                  ))}
                  {!enhancedResult && (
                    <p className="text-xs text-gray-500 italic">
                      Enhance your collage first to apply these suggestions
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Image List */}
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

            {/* Actions */}
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Canvas</h2>
                  <p className="text-sm text-gray-600">
                    Click to select. Drag to move. Use corner handle to scale, top handle to rotate. Right-click for
                    options.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Custom enhancement prompt (optional)"
                      value={enhancementPrompt}
                      onChange={e => setEnhancementPrompt(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isEnhancing}
                    />
                  </div>
                  <button
                    onClick={enhanceCollage}
                    disabled={images.length === 0 || isEnhancing}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed shadow-lg"
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
                      <RotateCcw className="h-4 w-4" />
                      Reset Transform
                    </button>
                    <hr className="my-1" />
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

            {/* Loading States */}
            {(isEnhancing || isAnalyzing || isApplyingSuggestion) && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="text-gray-600">
                    {isEnhancing && "AI is enhancing your collage..."}
                    {isAnalyzing && "AI is analyzing your collage..."}
                    {isApplyingSuggestion && "Applying AI suggestion..."}
                  </span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
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

                {/* Edit Controls */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Edit Generated Image</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Describe what you want to change..."
                      value={editPrompt}
                      onChange={e => setEditPrompt(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isEnhancing}
                    />
                    <button
                      onClick={editGeneratedImage}
                      disabled={!editPrompt.trim() || isEnhancing}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isEnhancing ? "Editing..." : "Edit"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You can edit this image as many times as you want. Each edit builds on the previous result.
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  Your collage has been transformed into a professional-quality asset using AI! Use the suggestions
                  above to refine it further.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Add Images</h3>
                <p>Upload your own or search Pexels for high-quality stock photos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Transform & Layer</h3>
                <p>Select, move, scale, rotate. Use handles or sidebar controls</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-800">AI Enhance</h3>
                <p>Add custom prompt & click Generate + get auto-suggestions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Edit & Refine</h3>
                <p>Use suggestions or custom edits to perfect your result</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                5
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Download & Share</h3>
                <p>Save your professional-quality enhanced collage</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
