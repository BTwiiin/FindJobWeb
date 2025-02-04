'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaPen } from 'react-icons/fa';
import { Button } from 'flowbite-react';

type Props = {
  id: string;
};

export default function EditIconButton({ id }: Props) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/jobposts/update/${id}`);
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
      title="Edit Job Post"
    >
      <FaPen size={16} />
    </Button>
  );
}
