'use client';

import React, { useState } from 'react';
import TemplateModal from '@/app/components/TemplateModal';
import { fetchWrapper } from '@/lib/fetchWrapper';
import { deleteImage } from '@/app/actions/jobPostActions';
import { FaSearch, FaTimes, FaTrash, FaUpload } from 'react-icons/fa';

interface ImageManagementModalProps {
    show: boolean;
    onClose: () => void;
    jobPostId: string;
    existingImages: string[];
    onImagesUpdated: (images: string[]) => void;
}

export default function ImageManagementModal({
    show,
    onClose,
    jobPostId,
    existingImages,
    onImagesUpdated,
}: ImageManagementModalProps) {
    const [newImages, setNewImages] = useState<File[]>([]);
    const [images, setImages] = useState<string[]>(existingImages);
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files); // Convert FileList to array
            setNewImages((prev) => [...prev, ...filesArray]); // Append new files
        }
    };

    const handleImageUpload = async () => {
        if (newImages.length > 0) {
            const formData = new FormData();
            newImages.forEach((file) => formData.append('images', file)); // Append all files

            const response = await fetchWrapper.post(`jobpost/upload-image/${jobPostId}`, formData);
            if (response && response.success) {
                const updatedImages = [...images, ...newImages.map(file => URL.createObjectURL(file))];
                setImages(updatedImages);
                onImagesUpdated(updatedImages);
                setNewImages([]); // Clear selected images
                setFileInputKey(Date.now()); // Reset file input
            }
        }
    };

    const handleImageDelete = async (imageUrl: string) => {
        const response = await deleteImage(imageUrl);
        if (response && response.success) {
            const updatedImages = images.filter(img => img !== imageUrl);
            setImages(updatedImages);
            onImagesUpdated(updatedImages);
        }
    };

    const handleRemoveFile = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index)); // Remove selected file
    };

    return (
        <TemplateModal show={show} onClose={onClose} title="Manage Images">
            <div className="flex flex-col gap-2">
                {/* Custom File Input */}
                <label className="cursor-pointer mt-2 bg-gray-600 text-white p-2 rounded inline-flex items-center">
                    <FaSearch className="mr-2" />
                    Choose Images
                    <input
                        key={fileInputKey}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

                {/* Display Selected Files */}
                {newImages.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                        <span className="text-black text-lg font-semibold">Added Images:</span>
                        {newImages.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-600 p-2 rounded shadow-md">
                                <p className="text-white text-sm flex-auto whitespace-nowrap">{file.name}</p>
                                <button 
                                    onClick={() => handleRemoveFile(index)} 
                                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition duration-200"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                <button 
                    onClick={handleImageUpload} 
                    className="mt-2 bg-gray-600 text-white p-2 rounded inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={newImages.length === 0}
                >
                    <FaUpload className="mr-2" />
                    Upload Images
                </button>
            </div>

            {/* Existing Images */}
            <div className="mt-4">
                <h3 className="font-semibold">Existing Images</h3>
                <div className="grid grid-cols-2 gap-2">
                    {images.map((image, index) => (
                        <div key={index} className="relative">
                            <img src={image} alt={`Uploaded Image ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
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
        </TemplateModal>
    );
}
