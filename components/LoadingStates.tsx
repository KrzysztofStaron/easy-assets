"use client";

import React from "react";

interface LoadingStatesProps {
  isEnhancing: boolean;
  isAnalyzing: boolean;
  isApplyingSuggestion: boolean;
}

const LoadingStates: React.FC<LoadingStatesProps> = ({ isEnhancing, isAnalyzing, isApplyingSuggestion }) => {
  if (!isEnhancing && !isAnalyzing && !isApplyingSuggestion) return null;

  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="text-gray-600">
          {isEnhancing && "AI is generating two versions and comparing them..."}
          {isAnalyzing && "AI is analyzing your collage..."}
          {isApplyingSuggestion && "Applying AI suggestion..."}
        </span>
      </div>
    </div>
  );
};

export default LoadingStates;
