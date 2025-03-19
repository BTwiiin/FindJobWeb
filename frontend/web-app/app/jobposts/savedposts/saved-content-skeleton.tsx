import React from 'react';

export default function SavedContentSkeleton() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Saved Job Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg shadow-md bg-gray-100 animate-pulse"
          >
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-16 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 