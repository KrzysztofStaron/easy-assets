"use client";

import React, { useState, useEffect } from "react";
import generate, { analyzeCollage } from "../action/generate";
import { ImageItem, ContextMenu } from "../../types";
import UploadArea from "../../components/UploadArea";
import PexelsSearch from "../../components/PexelsSearch";
import TransformControls from "../../components/TransformControls";
import AISuggestions from "../../components/AISuggestions";
import ImageList from "../../components/ImageList";
import Actions from "../../components/Actions";
import Canvas from "../../components/Canvas";
import EnhancedResult from "../../components/EnhancedResult";
import LoadingStates from "../../components/LoadingStates";
import ErrorDisplay from "../../components/ErrorDisplay";
import Instructions from "../../components/Instructions";

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
  const canvasSize = { width: 800, height: 600 };

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
    const canvas = document.querySelector("canvas");
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
    const canvas = document.querySelector("canvas");
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

  const selectedImageData = selectedImage ? images.find(img => img.id === selectedImage) || null : null;

  return (
    <div
      className="min-h-screen p-8 relative"
      style={{
        backgroundImage: `url('/bg.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Shader overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-orange-50/70"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-15">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <UploadArea onDrop={onDrop} />
            <PexelsSearch
              pexelsSearch={pexelsSearch}
              setPexelsSearch={setPexelsSearch}
              searchPexels={searchPexels}
              isSearchingPexels={isSearchingPexels}
              pexelsResults={pexelsResults}
              addPexelsImage={addPexelsImage}
            />
            <TransformControls
              selectedImageData={selectedImageData}
              updateImageTransform={updateImageTransform}
              resetImageTransform={resetImageTransform}
            />
            <AISuggestions
              suggestions={suggestions}
              enhancedResult={enhancedResult}
              isApplyingSuggestion={isApplyingSuggestion}
              applySuggestion={applySuggestion}
            />
            <ImageList
              images={images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              moveForward={moveForward}
              moveBackward={moveBackward}
              removeImage={removeImage}
            />
            <Actions images={images} clearCanvas={clearCanvas} downloadCanvas={downloadCanvas} />
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3 space-y-6">
            <Canvas
              images={images}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              draggedImage={draggedImage}
              setDraggedImage={setDraggedImage}
              dragOffset={dragOffset}
              setDragOffset={setDragOffset}
              transformMode={transformMode}
              setTransformMode={setTransformMode}
              initialTransform={initialTransform}
              setInitialTransform={setInitialTransform}
              setImages={setImages}
              canvasSize={canvasSize}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              removeImage={removeImage}
              resetImageTransform={resetImageTransform}
              moveToFront={moveToFront}
              moveForward={moveForward}
              moveBackward={moveBackward}
              moveToBack={moveToBack}
              enhancementPrompt={enhancementPrompt}
              setEnhancementPrompt={setEnhancementPrompt}
              enhanceCollage={enhanceCollage}
              isEnhancing={isEnhancing}
            />

            {/* Loading States */}
            <LoadingStates
              isEnhancing={isEnhancing}
              isAnalyzing={isAnalyzing}
              isApplyingSuggestion={isApplyingSuggestion}
            />

            {/* Error Display */}
            <ErrorDisplay error={error} />

            {/* Enhanced Result */}
            <EnhancedResult
              enhancedResult={enhancedResult}
              downloadEnhanced={downloadEnhanced}
              editPrompt={editPrompt}
              setEditPrompt={setEditPrompt}
              editGeneratedImage={editGeneratedImage}
              isEnhancing={isEnhancing}
            />
          </div>
        </div>

        {/* Instructions */}
        <Instructions />
      </div>
    </div>
  );
};

export default Home;
