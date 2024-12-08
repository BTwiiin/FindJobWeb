'use client'

import { useParamsStore } from '@/app/hooks/useParamsStore' 
import useModalStore from '@/app/hooks/useModalStore' 
import React from 'react'
import { FaSearch } from 'react-icons/fa'
import Modal from '@/app/components/FiltersModal';

export default function Search() {
    const setParams = useParamsStore(state => state.setParams);
    const setSearchValue = useParamsStore(state => state.setSearchValue);
    const searchValue = useParamsStore(state => state.searchValue);
    const openModal = useModalStore((state) => state.openModal);

    function onChange(event: any) {
        setSearchValue(event.target.value); 
    }

    function search() {
        setParams({ searchTerm: searchValue }); 
    }

    return (
        <div className='flex justify-between w-[50%] max-w-4xl'>
            <div className='flex items-center border-2 rounded-full  py-2 shadow-sm w-full'>
                <input 
                    onChange={onChange}
                    onKeyDown={(e: any) => {
                        if (e.key === 'Enter') search();  // Trigger search when Enter is pressed
                    }}
                    type="text" 
                    value={searchValue}
                    placeholder='Search for jobs by title'
                    className='
                        flex-grow pl-5 bg-transparent 
                        focus:outline-none border-transparent 
                        focus:border-transparent focus:ring-0 text-sm 
                        text-gray-600
                    '
                />
                <button>
                    <FaSearch size={34}
                        onClick={search} 
                        className='bg-gray-700 text-white rounded-full p-2 cursor-pointer mx-2' 
                    />
                </button>
            </div>
            <button className='bg-gray-700 text-white py-2 px-4 rounded-full ml-4' onClick={openModal}>
                Filters  &#709; 
            </button>
            <Modal/>
        </div>
    )
}
