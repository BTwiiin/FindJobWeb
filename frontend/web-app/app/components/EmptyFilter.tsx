"use client"

import { Button } from "@/components/ui/button"
import { useParamsStore } from "../hooks/useParamsStore"
import { Search } from "lucide-react"

export default function EmptyFilter() {
  const reset = useParamsStore((state) => state.reset)

  return (
    <div className="text-center py-12 px-4">
      <div className="inline-block p-6 bg-muted rounded-full mb-4">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No jobs found</h3>
      <p className="text-muted-foreground mb-6">
        Try adjusting your search or filters to find what you're looking for.
      </p>
      <Button onClick={reset}>Reset all filters</Button>
    </div>
  )
}

