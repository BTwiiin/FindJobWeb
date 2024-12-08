import { useEffect } from 'react';
import useModalStore from '@/app/hooks/useModalStore';

const Modal = () => {
    const { isModalOpen, closeModal } = useModalStore();
  
    if (!isModalOpen) return null;
  
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        onClick={closeModal}
      >
        <div
          className="bg-white p-5 rounded-lg w-1/3"
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside the modal
        >
          <h2 className="text-xl font-semibold">This is a Modal</h2>
          <p>Modal content goes here.</p>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded mt-4"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  
  export default Modal;