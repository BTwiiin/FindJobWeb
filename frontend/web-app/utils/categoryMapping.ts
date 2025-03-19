import { categoryOptions } from "@/types/options"

export function getCategoryLabel(categoryValue: string): string {
  // Flatten all options from all groups
  const allOptions = categoryOptions.flatMap(group => group.options)
  
  // Find the matching option
  const option = allOptions.find(opt => opt.value === categoryValue)
  
  // Return the Russian label if found, otherwise return the original value
  return option?.label || categoryValue
} 