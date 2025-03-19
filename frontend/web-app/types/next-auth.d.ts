import NextAuth, { type DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
 
declare module "next-auth" {
  interface Session {
    user: {
      username: string,
      role?: string,
      taxId?: string
    } & DefaultSession["user"]
    accessToken: string
  }

  interface Profile {
    username: string,
    email: string,
    name: string,
    role?: string,
    tax_number?: string
  }
  
  interface User {
    username: string,
    email: string,
    name: string,
    role?: string,
    taxId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string,
    accessToken: string,
    role?: string,
    taxId?: string
  }
}