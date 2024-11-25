import React from 'react'
import Logo from '@/app/nav/Logo'
import Search  from '@/app/nav/Search'

export default function Navbar() {
  return (
    <header className='
        sticky top-0 z-50 flex justify-between p-5 bg-white items-center text-gray-800 shadow-sm
        '>
      <Logo />
      
      <Search />
      <div>Login</div>
    </header>
  )
}
