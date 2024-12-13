'use client'

import { Button } from 'flowbite-react'
import Link from 'next/link';
import React from 'react'

type Props = {
    id: string;
}

export default function EditButton({id}: Props) {
  return (
    <Button className='px-6 py-2 bg-yellow-500 text-gray-800 rounded-md hover:bg-gray-200 transition-all'>
        <Link href={`/jobposts/update/${id}`}>Edit Job Post</Link>
    </Button>
  )
}
