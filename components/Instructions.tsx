"use client";

import React from "react";

const Instructions: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Add Images",
      desc: "Upload your own or search Pexels for high-quality stock photos",
    },
    {
      number: 2,
      title: "Transform & Layer",
      desc: "Select, move, scale, rotate. Use handles or sidebar controls",
    },
    {
      number: 3,
      title: "AI Enhance",
      desc: "Add custom prompt & click Generate + get auto-suggestions",
    },
    {
      number: 4,
      title: "Edit & Refine",
      desc: "Use suggestions or custom edits to perfect your result",
    },
    {
      number: 5,
      title: "Download & Share",
      desc: "Save your professional-quality enhanced collage",
    },
  ];

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-gray-600">
        {steps.map(step => (
          <div key={step.number} className="flex items-start gap-3">
            <div className="size-7 px-3 bg-blue-500 text-white rounded-md flex items-center justify-center text-xs font-bold shadow-sm">
              {step.number}
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instructions;
