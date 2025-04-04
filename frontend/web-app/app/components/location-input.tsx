"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLocationStore } from "@/app/hooks/useLocationStore"
import debounce from "lodash.debounce"

export default function LocationInput() {
  const [open, setOpen] = React.useState(false)
  const { suggestions, fetchSuggestions, setSelectedLocation, selectedLocation } = useLocationStore()
  const [displayValue, setDisplayValue] = React.useState("")

  // Set initial display value if location is already selected
  React.useEffect(() => {
    if (selectedLocation) {
      const address = [
        selectedLocation.street,
        selectedLocation.city,
        selectedLocation.country
      ].filter(Boolean).join(", ");
      setDisplayValue(address);
    }
  }, [selectedLocation]);

  const debouncedFetch = React.useCallback(
    debounce((value: string) => {
      fetchSuggestions(value)
    }, 400),
    [fetchSuggestions],
  )

  const handleSelect = (suggestion: any) => {
    // Set the display value for the button
    setDisplayValue(suggestion.label)
    
    // Set the actual location data in the store
    setSelectedLocation(suggestion.value)
    
    // Close the popover
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className="w-full justify-between"
        >
          {displayValue || "Select location..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search location..."
            onValueChange={(search) => {
              debouncedFetch(search)
            }}
          />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion.label}
                  value={suggestion.label}
                  onSelect={() => handleSelect(suggestion)}
                >
                  <Check className={cn(
                    "mr-2 h-4 w-4", 
                    displayValue === suggestion.label ? "opacity-100" : "opacity-0"
                  )} />
                  {suggestion.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
