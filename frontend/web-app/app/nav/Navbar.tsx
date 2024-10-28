import React from 'react'
import {FaHammer} from 'react-icons/fa'

export default function Navbar() {
  return (
    <header className='
        sticky top-0 z-50 flex justify-between p-5 bg-white items-center text-gray-800 shadow-sm
        '>
      <div className='flex items-center gap-2 text-3xl font-semibold'>
        <FaHammer size={34}/>
        <div>
          FindJob
        </div>
      </div>
      
      <div>Search</div>
      <div>Login</div>
    </header>
  )
}
