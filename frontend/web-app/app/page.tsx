import Listings from './jobposts/Listings';
import './globals.css';
import OrderBy from './jobposts/OrderBy';
import { MapComponent } from './components/MapComponent';


export default async function Home() {
  return (

    <div className="flex flex-row gap-2 h-screen -mt-6">
      <div className="flex-1 overflow-x-auto h-full hide-scrollbar">
        <div className="sticky top-0 z-10 bg-white shadow-md"> {/* Sticky header with shadow for visibility */}
          <div className="flex">
            <div className="flex-1 text-3xl font-semibold text-gray-800">
              Job Listings
            </div>
            <OrderBy />
          </div>
        </div>
        <div className="mt-6"> {/* Margin to provide space for sticky content */}
          <Listings />
        </div>
      </div>
      <div className="flex-1">
        <div className='sticky top-0 z-10 bg-white shadow-md'>
          <MapComponent />
        </div>
      </div>
    </div>

  );
}
