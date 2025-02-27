'use client'

import { useParamsStore } from '@/app/hooks/useParamsStore';
import { Button } from 'flowbite-react';
import React from 'react';
import { AiOutlineClockCircle,} from 'react-icons/ai';
import { TbPigMoney } from "react-icons/tb";

const orderButtons = [ 
    {
        label: 'Payment Amount',
        icon: TbPigMoney,
        value: 'paymentAmount'
    },
    {
        label: 'Recently Posted',
        icon: AiOutlineClockCircle,
        value: 'new'
    }
]

export default function OrderBy() {
    const setParams = useParamsStore((state) => state.setParams);
    const orderBy = useParamsStore((state) => state.orderBy);

    return (
        <div className='flex justify-between items-center mb-auto mt-2'>
            <Button.Group className='flex space-x-2'>
                {orderButtons.map(({label, icon: Icon, value}) => (
                    <Button
                        key={value}
                        onClick={() => setParams({orderBy: value})}
                        className={`group relative flex items-stretch justify-center p-0.5 text-center font-medium transition-[color,background-color,
                            border-color,text-decoration-color,fill,stroke] focus:z-10 focus:outline-none border border-gray-300 
                            bg-white text-gray-900 focus:ring-0 dark:border-gray-600 dark:bg-gray-600 
                            dark:text-white dark:enabled:hover:border-gray-700 rounded-full
                            hover:bg-gray-700`} // Same hover effect for all
                    >
                        <Icon className='mr-1 h-5' />
                        {label}
                    </Button>
                ))}
            </Button.Group>
        </div>
    )
}