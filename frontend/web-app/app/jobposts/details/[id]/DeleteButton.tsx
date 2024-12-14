'use client'

import { deleteJobPost } from '@/app/actions/jobPostActions';
import TemplateModal from '@/app/components/TemplateModal';
import { Button } from 'flowbite-react'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

type Props = {
    id: string;
}

export default function DeleteButton({id}: Props) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    const [showModal, setShowModal] = useState(false);

function handleDeleteClick() {
  setShowModal(true);
}

function confirmDelete() {
  setLoading(true);
  deleteJobPost(id)
    .then(res => {
      if (res.error) throw res.error;
      router.push('/');
    })
    .catch(err => {
      toast.error(err.status + ' ' + err.message);
    })
    .finally(() => {
      setLoading(false);
      setShowModal(false);
    });
}

return (
  <>
    <Button className='px-6 py-2 bg-red-500 text-gray-800 rounded-md hover:bg-red-200 transition-all' 
            onClick={handleDeleteClick}>Delete Job Post</Button>
    {showModal && (
      <TemplateModal 
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Deletion">
        <div className='flex flex-col'> 
            <p>Are you sure you want to delete this post?</p>
            <div className='flex flex-row justify-between mt-4'>
                <Button className='px-6 py-2 bg-red-500 text-gray-800 rounded-md hover:bg-red-200 transition-all'
                        onClick={confirmDelete}>Yes, delete</Button>

                <Button className='px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-all' 
                        onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
        </div>
      </TemplateModal>
    )}
  </>
);
}
