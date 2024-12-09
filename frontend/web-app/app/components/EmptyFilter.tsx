import { useParamsStore } from '@/app/hooks/useParamsStore'
import React from 'react'
import Heading from './Heading'
import { Button } from 'flowbite-react'

type Props = {
    title?: string
    subtitle?: string
    showReset?: boolean
}

export default function EmptyFilter({
    title = 'No matches for this filter',
    subtitle = 'Try changing or resetting the filter',
    showReset
}: Props) {
    const reset = useParamsStore(state => state.reset);

    return (
        <div className='
            h-[40vh] flex flex-col gap-2 justify-center items-center shadow-lg
        '>
            <Heading title={title} subtitle={subtitle} center />
            <div className=" mt-4">
                <Button onClick={reset} className="text-black outline-double">Remove filters</Button>
            </div>
        </div>
    )
}