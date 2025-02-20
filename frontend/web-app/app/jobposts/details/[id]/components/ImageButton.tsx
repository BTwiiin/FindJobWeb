'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaImage } from 'react-icons/fa6';
import { Button } from 'flowbite-react';

type Props = {
  id: string;
  images: string[];
};

export default function ImageIconButton({ id, images }: Props) {
  const router = useRouter();

  const handleEdit = () => {
    const queryParams = new URLSearchParams({ images: JSON.stringify(images) }).toString();
    router.push(`/jobposts/update-images/${id}?${queryParams}`);
  };

  return (
    <Button
      onClick={handleEdit}
      className="
        p-1 
        rounded 
        text-gray-600 
        hover:text-gray-800 
        hover:bg-gray-200 
        transition 
        transform 
        hover:scale-105
      "
      title="Manage Images"
    >
      <FaImage size={16} />
    </Button>
  );
}
