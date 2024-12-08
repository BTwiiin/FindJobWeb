'use client'

import { useParamsStore } from '@/app/hooks/useParamsStore';
import { Button } from 'flowbite-react';
import React from 'react';
import { AiOutlineClockCircle, AiOutlineSortAscending } from 'react-icons/ai';
import { BsFillStopCircleFill } from 'react-icons/bs';

const orderButtons = [ 
    {
        label: 'Payment Amount',
        icon: BsFillStopCircleFill,
        value: 'paymentAmount'
    },
    {
        label: 'Recently Posted',
        icon: AiOutlineClockCircle,
        value: 'new'
    }
]

export default function Filters() {
    const setParams = useParamsStore((state) => state.setParams);
    const orderBy = useParamsStore((state) => state.orderBy);

    return (
        <div className='flex justify-between items-center mb-4'>
            <Button.Group className='flex space-x-2'>
                {orderButtons.map(({label, icon: Icon, value}) => (
                    <Button
                        key={value}
                        onClick={() => setParams({orderBy: value})}
                        color={`${orderBy === value ? 'red' : 'gray'}`}
                    >
                        <Icon className='mr-1 h-5' />
                        {label}
                    </Button>
                ))}
            </Button.Group>
        </div>
    )
}