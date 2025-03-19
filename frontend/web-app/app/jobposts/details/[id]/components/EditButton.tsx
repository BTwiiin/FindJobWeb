'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';
import { FiEdit3 } from "react-icons/fi";

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
          px-3
          py-1
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
        title="Edit Job Post"
      >
        <div className='flex flex-row items-center'>
          <FiEdit3 size={14} className="mr-1.5" />
          <span>Edit</span>
        </div>
      </Button>
  );
}
