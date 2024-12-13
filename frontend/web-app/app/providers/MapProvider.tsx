'use client';

import { Libraries, useJsApiLoader } from '@react-google-maps/api';
import { ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const libraries: Libraries = ['places', 'drawing', 'geometry'];

export function MapProvider({ children }: { children: ReactNode }) {
  const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: libraries,
    version: 'weekly',
  });

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] bg-red-50 p-4 rounded">
        <FaExclamationTriangle className="text-red-600 text-6xl mb-4" />
        <p className="text-red-600 font-semibold text-xl">Error loading Google Maps</p>
        <p className="text-red-500 mt-2">Please check your network connection or API key.</p>
      </div>
    );
  }

  if (!scriptLoaded) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-100 rounded">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Loading Map...</p>
          <p className="text-gray-500 mt-1">Please wait while we load the map data.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
