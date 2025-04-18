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
import { MessageSquare } from 'lucide-react';

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
            <Dropdown.Item icon={HiUser} className='hover:scale-105 hover:bg-transparent'>
                <Link href="/profile">
                    Profile
                </Link>
            </Dropdown.Item>
            <Dropdown.Item icon={IoCreateOutline} className='hover:scale-105 hover:bg-transparent'>
                <Link href="/jobposts/create">
                    Create
                </Link>
            </Dropdown.Item>
            <Dropdown.Item icon={BsFilePostFill} className='hover:scale-105 hover:bg-transparent'>
                <Link href="/jobposts/savedposts">
                    Saved Posts
                </Link>
            </Dropdown.Item>
            <Dropdown.Item className='hover:scale-105 hover:bg-transparent'>
                <Link href="/chat" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Чат
                </Link>
            </Dropdown.Item>
            <Dropdown.Item icon={HiCog} className='hover:scale-105 hover:bg-transparent'>
                <Link href="/session">
                    Session
                </Link>
            </Dropdown.Item>
            <DropdownDivider />
            <DropdownItem icon={AiOutlineLogout} onClick={() => signOut({callbackUrl: '/'})} className='hover:scale-105 hover:bg-transparent'>
                Sign Out
            </DropdownItem>
        </Dropdown>
    )
}
