'use client'

import { Dropdown, DropdownDivider, DropdownItem } from 'flowbite-react'
import Link from 'next/link'
import { User } from 'next-auth'
import React from 'react'
import { useRouter } from 'next/navigation'
import { HiCog, HiUser } from 'react-icons/hi2'
import { signOut } from 'next-auth/react'
import { AiOutlineLogout } from 'react-icons/ai'

type Props ={
    user: User
}

export default function UserActions({user}: Props) {
    const router = useRouter()

    return (
        <Dropdown inline label={`Welcome ${user.name}`}>
            <Dropdown.Item icon={HiUser}>
                <Link href="/">
                    Profile
                </Link>
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
