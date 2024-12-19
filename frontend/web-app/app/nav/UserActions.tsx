'use client'

import { Dropdown, DropdownDivider, DropdownItem } from 'flowbite-react'
import Link from 'next/link'
import { User } from 'next-auth'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { HiCog, HiUser } from 'react-icons/hi2'
import { signOut } from 'next-auth/react'
import { AiOutlineLogout } from 'react-icons/ai'
import { IoCreateOutline } from "react-icons/io5";
import { useParamsStore } from '../hooks/useParamsStore'
import { BsFilePostFill } from "react-icons/bs";

type Props ={
    user: User
}

export default function UserActions({user}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const setParams = useParamsStore(state => state.setParams);

    function setEmployer(){
        setParams({searchTerm: user.username})
        if (pathname !== '/') router.push('/')
    }

    return (
        <Dropdown inline label={`Welcome ${user.name}`}>
            <Dropdown.Item icon={HiUser} className='hover:scale-105'>
            <Link href="/">
                Profile
            </Link>
            </Dropdown.Item>
            <Dropdown.Item icon={IoCreateOutline} className='hover:scale-105'>
            <Link href="/jobposts/create">
                Create
            </Link>
            </Dropdown.Item>
            <Dropdown.Item icon={BsFilePostFill} onClick={setEmployer} className='hover:scale-105'>
                My Posts
            </Dropdown.Item>
            <Dropdown.Item icon={HiCog} className='hover:scale-105'>
            <Link href="/session">
                Session
            </Link>
            </Dropdown.Item>
            <DropdownDivider />
            <DropdownItem icon={AiOutlineLogout} onClick={() => signOut({callbackUrl: '/'})} className='hover:scale-105'>
                Sign Out
            </DropdownItem>
        </Dropdown>
        
    )
}
