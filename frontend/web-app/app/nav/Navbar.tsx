import React from 'react'
import Logo from '@/app/nav/Logo'
import Search  from '@/app/nav/Search'
import LoginButton from './LoginButton'
import { getCurrentUser } from '../actions/authActions'
import UserActions from './UserActions'

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <header className='sticky top-0 z-50 flex justify-between p-5 bg-white items-center text-gray-800 shadow-sm'>
      <Logo />
      
      <Search />

      {user ? (
        <UserActions user={user}/>
      ) : (
        <LoginButton />
      )}
    </header>
  )
}
