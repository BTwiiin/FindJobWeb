import Listings from './jobposts/Listings';
import { MapComponent } from './components/Map';
import { MapProvider } from './providers/MapProvider';
import './globals.css';

export default async function Home() {
  return (
    <div className="flex flex-row gap-4 h-screen">
      <div className="flex-1 overflow-y-scroll h-full hide-scrollbar">
        <h3 className="text-3xl font-semibold">Job Listings</h3>
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
