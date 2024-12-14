import React from 'react';

export default function Loading() {
  return (
    <div className="mx-auto max-w-[75%] shadow-lg p-10 bg-white rounded-lg animate-pulse">
      <div className="flex flex-col space-y-4">
        {/* Placeholder for Heading */}
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>

        {/* Placeholder for JobPostForm fields */}
        <div className="mt-8 space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Spinner at the bottom to indicate loading */}
        <div className="flex justify-center mt-8">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}