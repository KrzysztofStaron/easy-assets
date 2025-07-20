"use client";

import React from "react";
import { Search } from "lucide-react";

interface PexelsSearchProps {
  pexelsSearch: string;
  setPexelsSearch: (value: string) => void;
  isSearchingPexels: boolean;
  pexelsResults: any[];
  addPexelsImage: (imageUrl: string) => void;
}

const PexelsSearch: React.FC<PexelsSearchProps> = ({
  pexelsSearch,
  setPexelsSearch,
  isSearchingPexels,
  pexelsResults,
  addPexelsImage,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Pexels</h2>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="tree, gorilla, T-Rex etc."
            value={pexelsSearch}
            onChange={e => setPexelsSearch(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isSearchingPexels}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
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
  );
};

export default PexelsSearch;
