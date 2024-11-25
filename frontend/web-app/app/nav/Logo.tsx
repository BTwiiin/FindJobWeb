'use client'

import React from 'react'
import { FaHammer } from 'react-icons/fa'
import { useParamsStore } from '../hooks/useParamsStore';

export default function Logo() {
    const reset = useParamsStore(state => state.reset);

    return (
        <div onClick={reset} className='cursor-pointer flex items-center gap-2 text-3xl font-semibold'>
            <FaHammer size={34}/>
            <div>
                FindJob
            </div>
        </div>
    )
}
