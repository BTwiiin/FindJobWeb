import { Loader2, HardHat, Hammer, Ruler, Truck, Wrench } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ConstructionLoadingProps {
  type?: "default" | "cards" | "minimal" | "truck"
  count?: number
  className?: string
}

export function ConstructionLoading({ type = "default", count = 6, className }: ConstructionLoadingProps) {
  // Choose which loading screen to display
  switch (type) {
    case "cards":
      return <JobCardsSkeleton count={count} className={className} />
    case "minimal":
      return <MinimalLoading className={className} />
    case "truck":
      return <TruckAnimation className={className} />
    default:
      return <DefaultLoading className={className} />
  }
}

function TruckAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      {/* Construction site animation scene */}
      <div className="relative w-full max-w-md h-48 mb-8 overflow-hidden bg-gradient-to-b from-blue-50 to-amber-50 rounded-lg border">
        {/* Road */}
        <div className="absolute bottom-0 w-full h-10 bg-gray-700">
          {/* Road markings */}
          <div className="absolute top-1/2 left-0 w-full h-1 flex">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-full w-8 bg-yellow-400 mx-3" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>

        {/* Construction barriers */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="absolute bottom-10 animate-barrier"
            style={{
              right: `${i * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: "8s",
            }}
          >
            <div className="w-6 h-12 bg-orange-500 relative">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white"></div>
            </div>
          </div>
        ))}

        {/* Truck */}
        <div className="absolute bottom-8 animate-truck">
          {/* Truck body */}
          <div className="relative">
            {/* Cabin */}
            <div className="absolute bottom-0 left-0 w-16 h-12 bg-yellow-500 rounded-t-lg border-2 border-yellow-600">
              {/* Windshield */}
              <div className="absolute top-1 right-1 w-6 h-6 bg-blue-300 border border-blue-400"></div>
              {/* Driver */}
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-800"></div>
            </div>

            {/* Truck bed */}
            <div className="absolute bottom-0 left-14 w-28 h-8 bg-gray-600 border-2 border-gray-700">
              {/* Load */}
              <div className="absolute top-[-8px] left-2 w-20 h-8 bg-amber-800 rounded-sm"></div>
            </div>

            {/* Wheels */}
            <div
              className="absolute bottom-[-4px] left-4 w-6 h-6 rounded-full bg-black border-2 border-gray-400 animate-spin"
              style={{ animationDuration: "1s" }}
            ></div>
            <div
              className="absolute bottom-[-4px] left-28 w-6 h-6 rounded-full bg-black border-2 border-gray-400 animate-spin"
              style={{ animationDuration: "1s" }}
            ></div>
          </div>
        </div>

        {/* Workers */}
        <div className="absolute bottom-10 left-[60%] animate-worker-1">
          <div className="relative">
            <HardHat className="h-6 w-6 text-yellow-500" />
            <div className="absolute top-6 left-1 w-4 h-8 bg-blue-500 rounded-sm"></div>
            <div className="absolute top-14 left-0 w-2 h-6 bg-gray-700"></div>
            <div className="absolute top-14 left-4 w-2 h-6 bg-gray-700"></div>
            <div className="absolute top-10 left-[-4px] w-3 h-2 bg-blue-500 animate-arm"></div>
          </div>
        </div>

        <div className="absolute bottom-10 left-[75%] animate-worker-2">
          <div className="relative">
            <HardHat className="h-6 w-6 text-orange-500" />
            <div className="absolute top-6 left-1 w-4 h-8 bg-green-600 rounded-sm"></div>
            <div className="absolute top-14 left-0 w-2 h-6 bg-gray-700"></div>
            <div className="absolute top-14 left-4 w-2 h-6 bg-gray-700"></div>
            <div
              className="absolute top-8 right-[-4px] w-3 h-2 bg-green-600 animate-arm"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        </div>

        {/* Construction sign */}
        <div className="absolute top-4 right-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-lg border-2 border-yellow-600 flex items-center justify-center">
            <Hammer className="h-8 w-8 text-black" />
          </div>
          <div className="w-2 h-20 bg-gray-700 mx-auto"></div>
        </div>
      </div>

      <h3 className="text-xl font-medium mb-2">Loading Construction Jobs</h3>
      <p className="text-muted-foreground text-center max-w-md">
        We're gathering the best construction opportunities for you. This will just take a moment...
      </p>

      {/* Progress bar animation */}
      <div className="w-64 h-1.5 bg-muted rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-progress-indeterminate" />
      </div>
    </div>
  )
}

function DefaultLoading({ className }: { className?: string }) {
  const constructionIcons = [
    { icon: HardHat, color: "text-yellow-500" },
    { icon: Hammer, color: "text-blue-500" },
    { icon: Ruler, color: "text-green-500" },
    { icon: Truck, color: "text-red-500" },
    { icon: Wrench, color: "text-purple-500" },
  ]

  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      <div className="relative mb-8">
        {/* Rotating construction icons */}
        <div className="relative h-24 w-24">
          {constructionIcons.map((IconObj, index) => {
            const Icon = IconObj.icon
            const delay = index * 0.15
            const rotate = index * (360 / constructionIcons.length)

            return (
              <div
                key={index}
                className={cn("absolute top-0 left-0 h-full w-full animate-pulse", IconObj.color)}
                style={{
                  animationDelay: `${delay}s`,
                  transform: `rotate(${rotate}deg) translateY(-16px)`,
                  opacity: 0.8,
                }}
              >
                <Icon className="h-8 w-8" />
              </div>
            )
          })}

          {/* Center loader */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-medium mb-2">Loading Construction Jobs</h3>
      <p className="text-muted-foreground text-center max-w-md">
        We're gathering the best construction opportunities for you. This will just take a moment...
      </p>

      {/* Progress bar animation */}
      <div className="w-64 h-1.5 bg-muted rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-progress-indeterminate" />
      </div>
    </div>
  )
}

function MinimalLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="flex items-center gap-3">
        <HardHat className="h-5 w-5 text-yellow-500 animate-bounce" />
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading construction jobs...</span>
      </div>
    </div>
  )
}

function JobCardsSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />

                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-24 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

