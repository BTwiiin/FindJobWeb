"use client"
import type React from "react"
import { Search, Filter, ChevronDown, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { useParamsStore } from "@/app/hooks/useParamsStore"
import { useState } from "react"
import { LinkedMenuItem } from "./LinkedMenuItem"
import { signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { categoryOptions } from "@/types/options"

// Define props type for the user
interface JobSearchHeaderClientProps {
  user: any; 
}

export default function JobSearchHeaderClient({ user }: JobSearchHeaderClientProps) {
  const [searchInput, setSearchInput] = useState("")
  const setParams = useParamsStore((state) => state.setParams)
  const reset = useParamsStore((state) => state.reset)

  const handleSearch = () => {
    setParams({ searchTerm: searchInput })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-primary">FindJob</h1>
        </Link>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for jobs by title, company, or location"
              className="pl-10 pr-4 py-2 w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Jobs</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">Category</DropdownMenuLabel>
                <LinkedMenuItem onClick={() => reset()}>All Categories</LinkedMenuItem>
                {categoryOptions.map((group) => (
                  <DropdownMenuSub key={group.group}>
                    <DropdownMenuSubTrigger className="text-sm">
                      {group.group}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {group.options.map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => setParams({ filterBy: option.value.toLowerCase() })}
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs">Salary Range</DropdownMenuLabel>
                <LinkedMenuItem onClick={() => setParams({ minSalary: 0, maxSalary: 5000 })}>
                  Any Salary
                </LinkedMenuItem>
                <LinkedMenuItem onClick={() => setParams({ minSalary: 0, maxSalary: 300 })}>
                  $0 - $300
                </LinkedMenuItem>
                <LinkedMenuItem onClick={() => setParams({ minSalary: 300, maxSalary: 500 })}>
                  $300 - $500
                </LinkedMenuItem>
                <LinkedMenuItem onClick={() => setParams({ minSalary: 500, maxSalary: 5000 })}>
                  $500+
                </LinkedMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <LinkedMenuItem href="/profile">Profile</LinkedMenuItem>
                <LinkedMenuItem href="/jobposts/savedposts">Saved Jobs</LinkedMenuItem>
                <LinkedMenuItem href="/applications">Applications</LinkedMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => signOut({callbackUrl: '/'})}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => signIn("id-server", { callbackUrl: '/'})} 
              variant="outline" className="gap-1"> 
                Login
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 