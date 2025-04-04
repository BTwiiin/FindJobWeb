import { Location } from "@/types"
import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    role?: string
    phoneNumber?: string
    location?: Location
    about?: string
    taxNumber?: string
    accessToken?: string
  }

  interface Session {
    user: User
    accessToken?: string
  }

  interface Profile {
    username: string,
    email: string,
    name: string,
    role?: string,
    tax_number?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    role?: string
    phoneNumber?: string
    location?: Location
    about?: string
    taxNumber?: string
    accessToken?: string
  }
}