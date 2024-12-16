'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useShallow } from 'zustand/shallow';
import { useEffect, useState } from 'react';
import { useParamsStore } from '../hooks/useParamsStore';
import { JobPost, PagedResult } from '@/types';
import qs from 'query-string';
import { getData } from '../actions/jobPostActions';
import MapJobPostCard from '../jobposts/cards/MapJobPostCard';


// Map styling
export const defaultMapContainerStyle = {
  width: '100%',
  height: '80vh',
  borderRadius: '15px 0px 0px 15px',
};

const customIcon = new L.Icon({
    iconUrl: '/marker.png',
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 32], // Anchor point of the icon
    popupAnchor: [0, -32], // Position of the popup relative to the icon
  });

const defaultMapCenter: [number, number] = [51.9194, 19.1451]; // Ensure center is a tuple
const defaultMapZoom = 6.3;

const jobLocations = [
  { id: 1, title: 'Job in Warsaw', lat: 52.2297, lng: 21.0122 },
  { id: 2, title: 'Job in Krakow', lat: 50.0647, lng: 19.945 },
  { id: 3, title: 'Job in Gdansk', lat: 54.352, lng: 18.646 },
];

const MapComponent = () => {
  const [data, setData] = useState<PagedResult<JobPost>>();  // Set state to store fetched data
    const params = useParamsStore(useShallow(state => ({
        searchTerm: state.searchTerm,
        pageSize: state.pageSize,
        searchValue: state.searchValue,
        orderBy: state.orderBy,
        filterBy: state.filterBy,
        employer: state.employer
    })));
  
    const setParams = useParamsStore(state => state.setParams);
  
    const url = qs.stringifyUrl({
      url: '',
      query: params
    });
  
    useEffect(() => {
        getData(url).then(data => {
            setData(data);
        })
    }, [url]);


  return (
    <div className="w-full">
      <MapContainer
        center={defaultMapCenter}
        zoom={defaultMapZoom}
        style={defaultMapContainerStyle}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            {...{
                attribution: '&copy; OpenStreetMap contributors', // Attribution spread correctly
            }}
        />


        {/* Job Markers */}
        {data && data.results.map((job) => (
          <Marker key={job.id} position={[job.location.latitude?? 0, job.location.longitude?? 0]} icon={customIcon}>
            <Popup>
              <MapJobPostCard jobPost={job}/>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export { MapComponent };
