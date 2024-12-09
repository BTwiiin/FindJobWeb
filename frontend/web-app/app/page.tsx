import Listings from './jobposts/Listings';
import { MapComponent } from './components/Map';
import { MapProvider } from './providers/MapProvider';
import './globals.css';
import Filters from './jobposts/Filters';

export default async function Home() {
  return (
    <div className="flex flex-row gap-2 h-screen -mt-6">
      <div className="flex-1 overflow-x-auto h-full hide-scrollbar">
        <div className="flex">
          <div className="flex-1 text-3xl font-semibold text-gray-800">
            Job Listings
          </div>
          <Filters />
        </div>
          <Listings />
      </div>
      <div className="flex-1">
        <h3 className="text-3xl font-semibold">Map</h3>
          <div className="sticky-container">
            <MapProvider>
              <MapComponent />
            </MapProvider>
          </div>
      </div>
    </div>
  );
}
