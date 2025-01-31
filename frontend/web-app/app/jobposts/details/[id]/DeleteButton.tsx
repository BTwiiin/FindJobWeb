'use client';

import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteJobPost } from '@/app/actions/jobPostActions';
import TemplateModal from '@/app/components/TemplateModal';
import { Button } from 'flowbite-react';

type Props = {
  id: string;
};

export default function DeleteIconButton({ id }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const openConfirm = () => setShowModal(true);
  const closeConfirm = () => setShowModal(false);

  async function confirmDelete() {
    setLoading(true);
    try {
      const res = await deleteJobPost(id);
      if (res.error) throw res.error;
      toast.success('Job post deleted successfully.');
      router.push('/');
    } catch (err: any) {
      toast.error(err.status + ' ' + err.message);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  return (
    <>
      <Button
        onClick={openConfirm}
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
        title="Delete Job Post"
      >
        <FaTrash size={16} />
      </Button>

      {showModal && (
        <TemplateModal
          show={showModal}
          onClose={closeConfirm}
          title="Confirm Deletion"
        >
          <div className="flex flex-col">
            <p>Are you sure you want to delete this job post?</p>
            <div className="flex flex-row justify-between mt-4">
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 transition-all"
              >
                {loading ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button
                onClick={closeConfirm}
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </TemplateModal>
      )}
    </>
  );
}
