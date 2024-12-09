import { useEffect, useState } from 'react';
import useModalStore from '@/app/hooks/useModalStore';
import { useParamsStore } from '../hooks/useParamsStore';
import { IoIosCloseCircle, IoIosCloseCircleOutline } from "react-icons/io";

const filterButtons = [
  {
    label: 'IT',
    value: 'it',
  },
  {
    label: 'Marketing',
    value: 'marketing',
  },
  {
    label: 'Manual Labor',
    value: 'manuallabor',
  },
  {
    label: 'Event Planning',
    value: 'eventplanning',
  },
  {
    label: 'Tutoring',
    value: 'tutoring',
  },
  {
    label: 'Entertainment',
    value: 'entertainment',
  },
  {
    label: 'Other',
    value: 'other',
  }
];

const Modal = () => {
    const { isModalOpen, closeModal } = useModalStore();
    const setParams = useParamsStore((state) => state.setParams);
    const filterBy = useParamsStore((state) => state.filterBy);
    const reset = useParamsStore(state => state.reset);
    const [isHovered, setIsHovered] = useState(false);
  
    useEffect(() => {
      if (!isModalOpen) {
        setIsHovered(false);
      }
    }, [isModalOpen]);

    if (!isModalOpen) return null;
  
    return (
      <div
        className="fixed overflow-auto inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        onClick={closeModal}
      >
        <div
          className="bg-white p-5 rounded-lg w-1/3"
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside the modal
        >
          <header className='sticky top-0 z-50 flex justify-between p-1 bg-white items-center text-gray-800'>
            <h2 className='text-3xl font-semibold'>
              
              Filters
            </h2>
            <button
              className="bg-white-500 text-black pb-5 rounded mt-4"
              onClick={closeModal}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}>
                {isHovered ? (
                  <IoIosCloseCircle size={40} className="text-pink-500" />
                ) : (
                  <IoIosCloseCircleOutline size={40} className="text-gray-500" />
                )}
            </button>
          </header>
          <div className="flex flex-col ">
            Categories
            {filterButtons.map(({ label, value }) => (
              <label key={value} className="flex items-center w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterBy === value}
                  onChange={() => setParams({ filterBy: value })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <span className={`text-gray-700 ${filterBy === value ? 'font-semibold' : ''}`}>{label}</span>
              </label>
            ))}
          </div>
          <footer className='sticky flex justify-between'>
            <button
              className="bg-pink-500 text-white py-2 px-4 rounded mt-4"
              onClick={reset}
            >
              Reset filters
            </button>
            <button
              className="bg-pink-500 text-white py-2 px-4 rounded mt-4"
              onClick={closeModal}>
                Show Offers
            </button>
          </footer>
        </div>
      </div>
    );
  };
  
  export default Modal;