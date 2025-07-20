"use client";

import React from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface UploadAreaProps {
  onDrop: (acceptedFiles: File[]) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Images</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-orange-400 bg-orange-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-orange-600">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Drag & drop images here, or click to select</p>
            <p className="text-sm text-gray-400">Supports JPG, PNG, GIF, WebP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadArea;
