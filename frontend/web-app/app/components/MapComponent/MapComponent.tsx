'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useShallow } from 'zustand/shallow';
import { useEffect, useState } from 'react';
import { JobPost, PagedResult } from '@/types';
import qs from 'query-string';
import { getData } from '@/app/actions/jobPostActions';
import { useParamsStore } from '@/app/hooks/useParamsStore';
import MapJobPostCard from '@/app/jobposts/cards/MapJobPostCard';
import { useJobHoverStore } from '@/app/hooks/useJobHoverStore';
import MarkerClusterGroup from 'react-leaflet-cluster';



export const defaultMapContainerStyle = {
  width: '100%',
  height: '87vh',
  borderRadius: '15px 0px 0px 15px',
};

const defaultIcon = new L.Icon({
  iconUrl: '/marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const hoverIcon = new L.Icon({
  iconUrl: '/marker.png',
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});


const defaultMapCenter: [number, number] = [51.9194, 19.1451]; // Ensure center is a tuple
const defaultMapZoom = 6.3;

const MapComponent = () => {
  const hoveredJobPostId = useJobHoverStore((state) => state.hoveredJobPostId);
  const [data, setData] = useState<PagedResult<JobPost>>();  // Set state to store fetched data
  
  const params = useParamsStore(useShallow(state => ({
      searchTerm: state.searchTerm,
      pageSize: state.pageSize,
      searchValue: state.searchValue,
      orderBy: state.orderBy,
      filterBy: state.filterBy,
      employer: state.employer
  })));

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
    <div style={{ zIndex: 10 }} className="w-full">
      <MapContainer
        center={defaultMapCenter}
        zoom={defaultMapZoom}
        style={defaultMapContainerStyle}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            {...{
                attribution: '&copy; OpenStreetMap contributors',
            }}
        />


        {/* Job Markers */}
        <MarkerClusterGroup chunkedLoading>
          {data && data.results.map((job) => (
              <Marker key={job.id} 
                      position={[job.location.latitude ?? 0, job.location.longitude ?? 0]}
                      icon={job.id === hoveredJobPostId ? hoverIcon : defaultIcon}
                      zIndexOffset={job.id === hoveredJobPostId ? 1000 : 0}
                      eventHandlers={{
                        mouseover: () => useJobHoverStore.setState({ hoveredJobPostId: job.id }),
                        mouseout: () => useJobHoverStore.setState({ hoveredJobPostId: null }),
                      }}
              >
              <Popup closeButton={false}>
                <MapJobPostCard jobPost={job}/>
              </Popup>
              </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
