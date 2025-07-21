"use client";

import React from "react";
import { Lightbulb, Target, Palette, Layout, FileText } from "lucide-react";

interface UserIntent {
  supportPrompt: string;
}

interface UserIntentDisplayProps {
  userIntent: UserIntent | null;
  isVisible: boolean;
  onToggle?: () => void;
}

const UserIntentDisplay: React.FC<UserIntentDisplayProps> = ({ userIntent, isVisible, onToggle }) => {
  if (!userIntent) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-800">AI Intent Analysis</h3>
        </div>
        {onToggle && (
          <button onClick={onToggle} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            {isVisible ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {isVisible && (
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <h4 className="text-sm font-medium text-orange-800 mb-1">AI Transformation Instructions</h4>
            <p className="text-sm text-orange-700">{userIntent.supportPrompt}</p>
            <p className="text-xs text-orange-600 mt-2 italic">
              These transformation instructions are automatically added to your custom prompt for better results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserIntentDisplay;
