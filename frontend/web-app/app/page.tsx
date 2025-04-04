import Listings from "./jobposts/Listings"
import { MapComponent } from "./components/MapComponent"
import JobSearchHeader from "./components/JobSearchHeader"
import MapInfoPanel from "./components/MapComponent/MapInfoPanel"
import { getCurrentUser } from "./actions/authActions"
import MyPostsPage from "./my-posts/my-posts-page"

export default async function Home() {
  const user = await getCurrentUser()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <JobSearchHeader />
      <div className="flex flex-col md:flex-row flex-1 h-[calc(100vh-64px)] relative">
        {user?.role === "employer" ? (
          <div className="flex-1 overflow-y-auto bg-gray-50 hide-scrollbar">
            <MyPostsPage />
          </div>
        ) : (
          <>
            {/* Listings Section - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-gray-50 hide-scrollbar">
              <Listings />
            </div>

            {/* Map Section - Fixed */}
            <div className="hidden md:block md:w-1/2 lg:w-2/5 xl:w-1/2">
              <div className="fixed top-[64px] right-0 md:w-1/2 lg:w-2/5 xl:w-1/2 h-[calc(100vh-64px)] bg-white shadow-md overflow-hidden">
                <MapInfoPanel />
                <div className="h-[calc(100%-48px)]">
                  <MapComponent />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

