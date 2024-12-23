import Listings from './jobposts/Listings';
import './globals.css';
import OrderBy from './jobposts/OrderBy';
import { MapComponent } from './components/MapComponent';


export default async function Home() {
  return (
    <div className="flex flex-row fixed h-screen w-screen">
      {/* Listings Section */}
      <div className="flex-1 overflow-y-auto bg-gray-100 hide-scrollbar">
        {/* Header Section */}
        <div className="sticky top-0 z-20 bg-white shadow-md">
          <div className="flex items-center justify-between px-4 py-2">
            <h1 className="text-3xl font-semibold text-gray-800">Posts</h1>
            <OrderBy />
          </div>
        </div>

        {/* Listings */}
        <div className="mt-6 px-4">
          <Listings />
        </div>
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



