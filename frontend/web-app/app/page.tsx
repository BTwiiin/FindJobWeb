import Listings from './jobposts/Listings';
import { MapComponent } from './components/Map';
import { MapProvider } from './providers/MapProvider';

export default async function Home() {
  return (
    <div className="flex flex-row gap-4">
      <div className="flex-1">
        <h3 className="text-3xl font-semibold">Job Listings</h3>
        <Listings />
      </div>
      <div className="flex-1">
        <h3 className="text-3xl font-semibold">MAP</h3>
          <MapProvider>
            <MapComponent />
          </MapProvider>
      </div>
    </div>
  );
}
