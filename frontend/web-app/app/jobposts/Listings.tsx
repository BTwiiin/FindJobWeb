"use client"

import { useEffect, useState } from "react"
import JobPostCard from "./cards/JobPostCard"
import qs from "query-string"
import { getData } from "@/app/actions/jobPostActions"
import { useParamsStore } from "@/app/hooks/useParamsStore"
import { useShallow } from "zustand/shallow"
import EmptyFilter from "../components/EmptyFilter"
import Loading from "./Loading"
import { useJobPostStore } from "../hooks/useJobPostStore"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import OrderBy from "./OrderBy"
import dynamic from "next/dynamic"
import MapInfoPanel from "../components/MapComponent/MapInfoPanel"
import { getCategoryLabel } from "@/utils/categoryMapping"

// Dynamic import for the map component with SSR disabled
const MapComponent = dynamic(
  () => import("@/app/components/MapComponent/MapComponent"),
  { ssr: false }
)

export default function Listings() {
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "map">("list")

  // Local state to handle fading in/out
  const [fading, setFading] = useState<"out" | "in">("in")

  // Add a resize handler to switch back to list view on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && view === "map") {
        setView("list");
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [view]);

  const params = useParamsStore(
    useShallow((state) => ({
      searchTerm: state.searchTerm,
      pageSize: state.pageSize,
      searchValue: state.searchValue,
      orderBy: state.orderBy,
      filterBy: state.filterBy,
      employer: state.employer,
      minSalary: state.minSalary,
      maxSalary: state.maxSalary,
    })),
  )

  const setParams = useParamsStore((state) => state.setParams)
  const reset = useParamsStore((state) => state.reset)

  const data = useJobPostStore(
    useShallow((state) => ({
      jobPosts: state.jobPosts,
      totalCount: state.totalCount,
    })),
  )

  const setData = useJobPostStore((state) => state.setData)

  const url = qs.stringifyUrl({
    url: "",
    query: params,
  })

  useEffect(() => {
    setFading("out")

    const fadeOutTimer = setTimeout(() => {
      getData(url).then((res) => {
        setData(res)
        setLoading(false)

        setFading("in")
      })
    }, 200)

    return () => clearTimeout(fadeOutTimer)
  }, [url, setData])

  const formatCategoryDisplay = (category: string) => {
    return getCategoryLabel(category);
  };

  if (loading) {
    return <Loading />
  }

  if (data.jobPosts?.length === 0 || !data.jobPosts) return <EmptyFilter />

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {params.searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                "{params.searchTerm}"
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => setParams({ searchTerm: "" })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {params.filterBy && (
              <Badge variant="outline" className="flex items-center gap-1">
                {formatCategoryDisplay(params.filterBy)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => setParams({ filterBy: "" })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {(params.minSalary !== 0 || params.maxSalary !== 5000) && (
              <Badge variant="outline" className="flex items-center gap-1">
                {params.maxSalary === 5000 
                  ? `$${params.minSalary}+`
                  : params.minSalary === 0
                  ? `Up to $${params.maxSalary}`
                  : `$${params.minSalary} - $${params.maxSalary}`
                }
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={() => setParams({ minSalary: 0, maxSalary: 5000 })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {(params.searchTerm || params.filterBy || params.minSalary !== 0 || params.maxSalary !== 5000) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => reset()}
              >
                Сбросить все
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OrderBy />

          <div className="md:hidden">
            <Tabs value={view} className="w-[120px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list" onClick={() => setView("list")}>
                  Список
                </TabsTrigger>
                <TabsTrigger value="map" onClick={() => setView("map")}>
                  Карта
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Conditionally render based on view state */}
      {view === "list" ? (
        <div
          className={`
            grid gap-4 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 pb-32
            transition-opacity duration-500
            ${fading === "out" ? "opacity-0" : "opacity-100"}
          `}
        >
          {data.jobPosts?.map((jobpost) => (
            <JobPostCard jobPost={jobpost} key={jobpost.id} />
          ))}
        </div>
      ) : (
        <div className="h-[calc(100vh-20rem)]">
          <MapInfoPanel />
          <MapComponent />
        </div>
      )}
    </div>
  )
}

