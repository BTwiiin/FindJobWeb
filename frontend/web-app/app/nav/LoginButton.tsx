'use client'

import { Button } from 'flowbite-react'
import { signIn } from 'next-auth/react'

import React from 'react'

export default function LoginButton() {
  return (
    <Button onClick={() => signIn("id-server", { callbackUrl: '/'})} 
        className="outline text-black hover:bg-gray-100"> 
        Login
    </Button>
  )
}
