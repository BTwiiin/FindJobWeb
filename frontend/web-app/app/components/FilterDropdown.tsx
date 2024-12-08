'use client'

import React, { useState } from 'react';

const options = ['Default', 'Latest', 'Highest salary', 'Lowest salary'];

export const DropdownButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left bg-white">
      <button
        onClick={toggleDropdown}
        className=" text-gray-800 px-10 py-2 rounded-md focus:outline-none bg-white"
      >
        Default <span className="ml-2">▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul>
            {options.map((option, index) => (
              <li key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
