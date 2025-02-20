'use client'

import TemplateModal from '@/app/components/TemplateModal';
import React, { useState } from 'react';

interface ImageGalleryProps {
    images: string[];
}

export default function ImageGallery({images}: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="flex h-full justify-center items-center">
                <img src="/no-images.svg" alt="No images available" className="w-32 h-32 object-contain" /> {/* Adjust size here */}
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="relative">
            <img
                src={images[currentIndex]}
                alt={`Job Post Image ${currentIndex + 1}`}
                className="w-full h-64 object-cover rounded-md"
                onClick={openModal}
            />
            
            {/* Previous Button */}
            <button
                onClick={goToPrevious}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full bg-opacity-50 hover:bg-opacity-75"
            >
                &#10094;
            </button>
            
            {/* Next Button */}
            <button
                onClick={goToNext}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full bg-opacity-50 hover:bg-opacity-75"
            >
                &#10095;
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                    <span
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                            index === currentIndex ? 'bg-white' : 'bg-gray-400'
                        }`}
                    ></span>
                ))}
            </div>
            {/* Modal for Enlarged Image */}
            <TemplateModal show={isModalOpen} onClose={closeModal} title={`Images`}>
                <div className="relative">
                    <img
                        src={images[currentIndex]}
                        alt={`Job Post Image ${currentIndex + 1}`}
                        className="w-full h-auto"
                    />
                    {/* Previous Button in Modal */}
                    <button
                        onClick={goToPrevious}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full bg-opacity-50 hover:bg-opacity-75"
                    >
                        &#10094;
                    </button>
                    
                    {/* Next Button in Modal */}
                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full bg-opacity-50 hover:bg-opacity-75"
                    >
                        &#10095;
                    </button>
                </div>
            </TemplateModal>
        </div>
    );
}
