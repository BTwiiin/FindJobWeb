'use client';

import { Button } from 'flowbite-react';
import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoIosCloseCircle, IoIosCloseCircleOutline } from 'react-icons/io';

type ModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function TemplateModal({ show, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensures the modal is rendered after the component mounts.
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  if (!mounted) return null;

  return createPortal(
    show ? (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          className="bg-white w-full max-w-md max-h-[90vh] rounded-lg shadow-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button
              className="bg-white text-black rounded mt-4"
              onClick={onClose}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isHovered ? (
                <IoIosCloseCircle size={40} className="text-gray-500" />
              ) : (
                <IoIosCloseCircleOutline size={40} className="text-gray-500" />
              )}
            </Button>
          </div>
          {/* Content */}
          <div className="p-4 overflow-y-auto flex-grow hide-scrollbar">
            {children}
          </div>
        </div>
      </div>
    ) : null,
    document.body
  );
}
