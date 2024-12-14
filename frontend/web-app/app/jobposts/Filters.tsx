import { useEffect, useState } from 'react';
import useModalStore from '@/app/hooks/useModalStore';
import { useParamsStore } from '../hooks/useParamsStore';
import { IoIosCloseCircle, IoIosCloseCircleOutline } from "react-icons/io";
import { Button } from 'flowbite-react';

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
    const setParams = useParamsStore((state) => state.setParams);
    const filterBy = useParamsStore((state) => state.filterBy);
    const reset = useParamsStore(state => state.reset);
  
    return (
        <div>
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
          <footer className='sticky flex justify-center'>
            <Button
              className="bg-gray-500 text-white py-2 px-4 rounded mt-4"
              onClick={reset}
            >
              Reset filters
            </Button>
          </footer>
        </div>
    );
  };
  
  export default Modal;