import Listings from './jobposts/Listings';
import './globals.css';
import OrderBy from './jobposts/OrderBy';
import { MapComponent } from './components/MapComponent';


export default async function Home() {
  return (
    <div className="flex flex-row fixed h-screen w-screen">
      {/* Listings Section */}
      <div className="flex-1 overflow-y-auto bg-gray-100 hide-scrollbar">
        <Listings />
      </div>

      {/* Map Section */}
      <div className="flex-1 h-full bg-white shadow-md">
        {/* Map Container */}
        <div className="sticky top-0 h-full">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}



