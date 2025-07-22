"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ComparisonResult {
  winner: "image1" | "image2";
  reason: string;
  score1: number;
  score2: number;
  image1Url: string | null;
  image2Url: string | null;
}

interface ComparisonDisplayProps {
  comparison: ComparisonResult;
  onClose: () => void;
}

const ComparisonDisplay: React.FC<ComparisonDisplayProps> = ({ comparison, onClose }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Image Comparison Results</CardTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Winner Announcement */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold text-center mb-2">
              🏆 Winner: {comparison.winner === "image1" ? "Image 1" : "Image 2"}
            </h3>
            <p className="text-gray-700 text-center">{comparison.reason}</p>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Image 1 Score</h4>
              <div className={`p-4 rounded-lg ${getScoreBg(comparison.score1)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quality Score:</span>
                  <span className={`text-lg font-bold ${getScoreColor(comparison.score1)}`}>
                    {comparison.score1}/10
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        comparison.score1 >= 8
                          ? "bg-green-500"
                          : comparison.score1 >= 6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${(comparison.score1 / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Image 2 Score</h4>
              <div className={`p-4 rounded-lg ${getScoreBg(comparison.score2)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quality Score:</span>
                  <span className={`text-lg font-bold ${getScoreColor(comparison.score2)}`}>
                    {comparison.score2}/10
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        comparison.score2 >= 8
                          ? "bg-green-500"
                          : comparison.score2 >= 6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${(comparison.score2 / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Comparison */}
          {comparison.image1Url && comparison.image2Url && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Generated Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-2 rounded-lg border-2 ${
                    comparison.winner === "image1" ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <img src={comparison.image1Url} alt="Generated Image 1" className="w-full h-auto rounded-lg" />
                  <p className="text-center mt-2 text-sm font-medium">
                    Image 1 {comparison.winner === "image1" && "🏆"}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg border-2 ${
                    comparison.winner === "image2" ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <img src={comparison.image2Url} alt="Generated Image 2" className="w-full h-auto rounded-lg" />
                  <p className="text-center mt-2 text-sm font-medium">
                    Image 2 {comparison.winner === "image2" && "🏆"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonDisplay;
