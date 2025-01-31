'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaPen } from 'react-icons/fa';

type Props = {
  id: string;
};

export default function EditIconButton({ id }: Props) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/jobposts/update/${id}`);
  };

  return (
    <button
      onClick={handleEdit}
      className="p-2 rounded hover:bg-gray-200 text-gray-600"
      title="Edit Job Post"
    >
      <FaPen size={18} />
    </button>
  );
}
