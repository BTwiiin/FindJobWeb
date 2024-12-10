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
            <Dropdown.Item icon={HiUser}>
                <Link href="/">
                    Profile
                </Link>
            </Dropdown.Item>
            <Dropdown.Item icon={IoCreateOutline}>
                <Link href="/jobposts/create">
                    Create
                </Link>
            </Dropdown.Item>
            <Dropdown.Item icon={BsFilePostFill} onClick={setEmployer}>
                    My Posts
            </Dropdown.Item>
            <Dropdown.Item icon={HiCog}>
                <Link href="/session">
                    Session
                </Link>
            </Dropdown.Item>
            <DropdownDivider />
            <DropdownItem icon={AiOutlineLogout} onClick={() => signOut({callbackUrl: '/'})}>
                Sign Out
            </DropdownItem>
        </Dropdown>
        
    )
}
