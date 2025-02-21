import React from "react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[75%] shadow-lg p-10 bg-white rounded-lg mt-3 animate-pulse">
      {/* Title Placeholder */}
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>

      {/* Images Placeholder */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="relative group">
            <div className="w-full h-32 bg-gray-200 rounded-md"></div>
            <div className="absolute top-1 right-1 bg-gray-300 p-2 rounded w-6 h-6"></div>
          </div>
        ))}
      </div>

      {/* Upload Button Placeholder */}
      <div className="flex justify-center mt-4">
        <div className="h-10 bg-gray-200 rounded w-40"></div>
      </div>
    </div>
  );
}
