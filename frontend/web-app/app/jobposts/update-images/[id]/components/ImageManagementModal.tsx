'use client';

import React, { useState } from 'react';
import TemplateModal from '@/app/components/TemplateModal';
import { FaSearch, FaTimes, FaUpload } from 'react-icons/fa';
import { uploadImages } from '@/app/actions/jobPostActions';
import toast from 'react-hot-toast';

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
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>(existingImages);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewImages((prev) => [...prev, ...filesArray]);
            setImagePreviews((prev) => [
                ...prev,
                ...filesArray.map((file) => URL.createObjectURL(file)),
            ]);
        }
    };

    const handleImageUpload = async () => {
        if (newImages.length === 0) return;
        setUploading(true);

        const formData = new FormData();
        newImages.forEach((file) => formData.append('images', file));

        const response = await uploadImages(jobPostId, formData);
        if (response?.status === "success") {
            toast.success(response.message);
            onImagesUpdated([...images, ...response.imageUrls]);
            setImages([...images, ...response.imageUrls]);
            setNewImages([]);
            setImagePreviews([]);
            setFileInputKey(Date.now());
            onClose();
        } else {
            toast.error(`Upload failed: ${response?.error.message}`);
        }

        setUploading(false);
    };

    const handleRemoveFile = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <TemplateModal show={show} onClose={onClose} title="Manage Images">
            <div className="flex flex-col gap-4">
                {/* Drag and Drop or File Input */}
                <label className="cursor-pointer bg-gray-600 text-white p-3 rounded-lg inline-flex items-center justify-center gap-2 transition hover:bg-gray-700">
                    <FaSearch />
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

                {/* Preview Selected Images */}
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((src, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={src}
                                    alt="Selected Preview"
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-75 group-hover:opacity-100 transition"
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
                    className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center gap-2 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={newImages.length === 0 || uploading}
                >
                    {uploading ? (
                        <>
                            <FaUpload className="animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <FaUpload />
                            Upload Images
                        </>
                    )}
                </button>
            </div>

            {/* Existing Images */}
            <div className="mt-4">
                <h3 className="font-semibold">Existing Images</h3>
                <div className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Uploaded ${index}`}
                            className="w-full h-24 object-cover rounded-md shadow-md"
                        />
                    ))}
                </div>
            </div>
        </TemplateModal>
    );
}
