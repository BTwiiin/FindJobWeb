import Listings from './jobposts/Listings';
import './globals.css';
import OrderBy from './jobposts/OrderBy';
import { MapComponent } from './components/MapComponent';


export default async function Home() {
  return (

    <div className="flex flex-row gap-2 h-screen -mt-6">
      <div className="flex-1 overflow-x-auto h-full hide-scrollbar bg-gray-100">
        <div className="sticky top-0 z-10 bg-white shadow-md">
          <div className="flex">
            <div className="flex-1 text-3xl font-semibold text-gray-800">
              Posts
            </div>
            <OrderBy />
          </div>
        </div>
        <div className="mt-6">
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
