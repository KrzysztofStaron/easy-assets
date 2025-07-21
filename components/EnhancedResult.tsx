"use client";

import React from "react";
import { Download, Sparkles } from "lucide-react";

interface EnhancedResultProps {
  enhancedResult: string | null;
  downloadEnhanced: () => void;
  editPrompt: string;
  setEditPrompt: (prompt: string) => void;
  editGeneratedImage: () => void;
  isEnhancing: boolean;
  enhancementPrompt: string;
}

const EnhancedResult: React.FC<EnhancedResultProps> = ({
  enhancedResult,
  downloadEnhanced,
  editPrompt,
  setEditPrompt,
  editGeneratedImage,
  isEnhancing,
  enhancementPrompt,
}) => {
  if (!enhancedResult) return null;

  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">AI Enhanced Result</h2>
          {!enhancementPrompt.trim() && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                💡 <strong>Tip:</strong> Use custom prompts for better results!
              </span>
            </div>
          )}
        </div>
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isEnhancing}
          />
          <button
            onClick={editGeneratedImage}
            disabled={!editPrompt.trim() || isEnhancing}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
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
        Your collage has been transformed into a professional-quality asset using AI! Use the suggestions above to
        refine it further.
      </p>
    </div>
  );
};

export default EnhancedResult;
