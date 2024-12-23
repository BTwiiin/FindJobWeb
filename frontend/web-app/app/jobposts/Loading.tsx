import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col w-full gap-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg p-4 m-1 w-full shadow-sm animate-pulse"
        >
          {/* Left Section: Placeholder for Logo and Primary Info */}
          <div className="flex md:items-center md:w-1/4 mb-4 md:mb-0 md:mr-4">
            <div className="w-14 h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded mr-3"></div>
            <div className="flex flex-col justify-center w-full">
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-2"></div>
              <div className="flex items-center">
                <div className="w-8 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded mr-2"></div>
                <div className="w-16 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Right Section: Placeholder for Details */}
          <div className="flex flex-col md:flex-row md:justify-between md:flex-1">
            <div className="flex flex-col md:mr-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mr-2"></div>
                <div className="w-24 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mr-2"></div>
                <div className="w-32 h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
              </div>
            </div>

            <div className="flex items-center md:items-start mt-2 md:mt-0">
              <div className="w-20 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
