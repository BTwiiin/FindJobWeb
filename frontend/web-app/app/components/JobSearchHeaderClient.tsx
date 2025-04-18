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
import { useRouter } from "next/navigation"

interface JobSearchHeaderClientProps {
  user: any; 
}

export default function JobSearchHeaderClient({ user }: JobSearchHeaderClientProps) {
  const router = useRouter()
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

  const showSearchAndFilter = !user || user.role === 'employee'

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-primary">FindJob</h1>
        </Link>

        {showSearchAndFilter && (
          <>
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск вакансий по названию, компании или местоположению"
                  className="pl-10 pr-4 py-2 w-full bg-white"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Фильтры</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Фильтр вакансий</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs">Категория</DropdownMenuLabel>
                  <LinkedMenuItem onClick={() => reset()}>Все категории</LinkedMenuItem>
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
                  <DropdownMenuLabel className="text-xs">Зарплата</DropdownMenuLabel>
                  <LinkedMenuItem onClick={() => setParams({ minSalary: 0, maxSalary: 5000 })}>
                    Любая зарплата
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
          </>
        )}

        <div className={`flex items-center ${!showSearchAndFilter ? 'ml-auto' : 'gap-3'}`}>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Аватар пользователя" />
                    <AvatarFallback>П</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <LinkedMenuItem href="/profile">Профиль</LinkedMenuItem>
                <LinkedMenuItem href="/chat">Чат</LinkedMenuItem>
                { user.role === 'employee' && (
                  <>
                    <LinkedMenuItem href="/jobposts/savedposts">Сохраненные вакансии</LinkedMenuItem>
                    <LinkedMenuItem href="/applications">Мои отклики</LinkedMenuItem>
                  </>
                )}
                { user.role === 'employer' && (
                  <>
                    <LinkedMenuItem href="/my-posts">Мои предложения</LinkedMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => signOut({callbackUrl: '/'})}>
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push('/auth/login')} 
              variant="outline" className="gap-1"> 
                Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}