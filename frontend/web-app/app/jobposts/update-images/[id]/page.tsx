'use client'

import Heading from '@/app/components/Heading';
import React, { useState } from 'react';
import { deleteImage } from '@/app/actions/jobPostActions';
import ImageManagementModal from './components/ImageManagementModal';
import { useParams, useSearchParams } from 'next/navigation';
import { FaTrash, FaUpload } from 'react-icons/fa';

export default function UpdateImages(props: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const images = JSON.parse(searchParams.get('images') || '[]');
    const imageUrls = Array.isArray(images) ? images : [];
    const params = useParams();
    const id = params.id;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImages, setCurrentImages] = useState(imageUrls);

    const handleImageDelete = async (imageUrl: string) => {
        const response = await deleteImage(imageUrl, );
        if (response && response.success) {
            setCurrentImages(currentImages.filter(img => img !== imageUrl));
        }
    };

    return (
        <div className='mx-auto max-w-[75%] shadow-lg p-10 bg-white rounded-lg mt-3'>
            <Heading title='Manage Job Post Images' subtitle='Add or remove images for this job post' />
            <div className="mt-4">
                <h3 className="font-semibold text-gray-600 mb-2">Current Images</h3>
                <div className="grid grid-cols-2 gap-4">
                    {currentImages.map((image, index) => (
                        <div key={index} className="relative">
                            <img src={image} alt={`Job Post Image ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                            <button
                                onClick={() => handleImageDelete(image)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-center mt-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gray-600 text-white p-2 rounded"
                >
                    <span className="inline-flex items-center">
                        <FaUpload className="mr-2" />
                        Upload New Image
                    </span>
                </button>
            </div>

            {/* Image Management Modal */}
            <ImageManagementModal
                show={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                jobPostId={id as string}
                existingImages={currentImages}
                onImagesUpdated={setCurrentImages}
            />
        </div>
    );
}