'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the Map components to handle SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type LocationProps = {
  latitude: number;
  longitude: number;
};

const customIcon = new L.Icon({
  iconUrl: '/marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const MapComponent = ({ latitude, longitude }: LocationProps) => {
  const defaultZoom = 13; // Zoom level for a closer view

  return (
    <div style={{ zIndex: 10 }} className="w-full h-64 rounded-lg shadow-md overflow-hidden">
      <MapContainer
        center={[latitude, longitude]}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[latitude, longitude]} icon={customIcon} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
