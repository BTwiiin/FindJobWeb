"use client"

import { useParamsStore } from "@/app/hooks/useParamsStore"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign } from "lucide-react"

const orderButtons = [
  {
    label: "По зарплате",
    icon: DollarSign,
    value: "paymentAmount",
  },
  {
    label: "По дате публикации",
    icon: Clock,
    value: "new",
  },
]

export default function OrderBy() {
  const setParams = useParamsStore((state) => state.setParams)
  const orderBy = useParamsStore((state) => state.orderBy)

  return (
    <div className="flex gap-2">
      {orderButtons.map(({ label, icon: Icon, value }) => (
        <Button
          key={value}
          onClick={() => setParams({ orderBy: value })}
          variant={orderBy === value ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-1"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  )
}

