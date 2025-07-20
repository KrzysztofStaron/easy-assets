"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

interface AISuggestionsProps {
  suggestions: string[];
  enhancedResult: string | null;
  isApplyingSuggestion: boolean;
  applySuggestion: (suggestion: string) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  suggestions,
  enhancedResult,
  isApplyingSuggestion,
  applySuggestion,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        AI Suggestions
      </h2>
      <p className="text-xs text-gray-500 mb-3 italic">Generated automatically after enhancement</p>

      {suggestions.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-gray-400 mb-2">
            <Lightbulb className="h-8 w-8 mx-auto opacity-50" />
          </div>
          <p className="text-sm text-gray-500 mb-2">No suggestions yet</p>
          <p className="text-xs text-gray-400">Enhance your collage to get AI-powered improvement suggestions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              disabled={!enhancedResult || isApplyingSuggestion}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-sm font-medium text-gray-800 mb-1">Suggestion {index + 1}</div>
              <div className="text-xs text-gray-600">{suggestion}</div>
            </button>
          ))}
          {!enhancedResult && (
            <p className="text-xs text-gray-500 italic">Enhance your collage first to apply these suggestions</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
