'use client'

import { FaTrash, FaUpload } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Loading spinner
import toast from "react-hot-toast";
import { useState } from "react";
import ImageManagementModal from "./components/ImageManagementModal";
import { deleteImage } from "@/app/actions/jobPostActions";
import { useParams, useSearchParams } from "next/navigation";

export default function UpdateImages(props: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const images = JSON.parse(searchParams.get("images") || "[]");
    const imageUrls = Array.isArray(images) ? images : [];
    const params = useParams();
    const id = params.id;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImages, setCurrentImages] = useState(imageUrls);
    const [loadingImage, setLoadingImage] = useState<string | null>(null); // Track which image is being deleted

    const handleImageDelete = async (imageUrl: string) => {
        setLoadingImage(imageUrl); // Mark the image as "loading"

        const cleanUrl = imageUrl.split("?")[0];
        const key = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);

        if (!key) {
            toast.error("Failed to extract image key");
            setLoadingImage(null);
            return;
        }

        const response = await deleteImage(key, id as string);

        if (response?.message) {
            toast.success(response.message);
            setCurrentImages((prev) => prev.filter((img) => img !== imageUrl));
        } else {
            toast.error(`Failed to delete image! ${response?.error.status}: ${response?.error.message}`);
        }

        setLoadingImage(null); // Reset loading state
    };

    return (
        <div className="mx-auto max-w-[75%] shadow-lg p-10 bg-white rounded-lg mt-3">
            <h1 className="text-xl font-semibold">Manage Job Post Images</h1>
            <h3 className="text-gray-600 mb-4">Add or remove images for this job post</h3>

            <div className="mt-4">
                <h3 className="font-semibold text-gray-600 mb-2">Current Images</h3>
                <div className="grid grid-cols-2 gap-4">
                    {currentImages.map((image, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={image}
                                alt={`Job Post Image ${index + 1}`}
                                className={`w-full h-32 object-cover rounded-md transition-opacity ${
                                    loadingImage === image ? "opacity-50" : "opacity-100"
                                }`}
                            />
                            <button
                                onClick={() => handleImageDelete(image)}
                                disabled={!!loadingImage}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded disabled:bg-gray-400"
                            >
                                {loadingImage === image ? (
                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                ) : (
                                    <FaTrash />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center mt-4">
                <button onClick={() => setIsModalOpen(true)} className="bg-gray-600 text-white p-2 rounded">
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
