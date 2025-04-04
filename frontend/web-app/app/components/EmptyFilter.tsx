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
      <h3 className="text-lg font-medium mb-2">Вакансии не найдены</h3>
      <p className="text-muted-foreground mb-6">
        Попробуйте изменить параметры поиска или фильтры, чтобы найти то, что вы ищете.
      </p>
      <Button onClick={reset}>Сбросить все фильтры</Button>
    </div>
  )
}

