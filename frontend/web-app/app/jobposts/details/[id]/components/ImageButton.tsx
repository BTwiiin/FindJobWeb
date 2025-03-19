'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PiImagesSquareBold } from "react-icons/pi";
import { Button } from 'flowbite-react';

interface Props {
  id: string;
}

export default function ImageIconButton({ id }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/jobposts/update-images/${id}`);
  };

  return (
    <Button
      onClick={handleClick}
      className="
        px-3
        py-1
        ml-2
        rounded 
        bg-gray-100
        text-gray-700
        hover:bg-gray-200
        transition 
        border border-gray-300
        flex
        items-center
        text-sm
      "
      title="Manage Images"
    >
      <div className='flex flex-row items-center'>
        <PiImagesSquareBold size={14} className="mr-1.5" />
        <span>Images</span>
      </div>
    </Button>
  );
}
