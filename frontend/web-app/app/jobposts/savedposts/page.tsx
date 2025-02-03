'use client';

import { useEffect, useState } from 'react';
import { savedPosts, getJobPostById, saveJobPost } from '@/app/actions/jobPostActions';
import { JobPost, SavedPost } from '@/types';
import Link from 'next/link';
import Loading from './loading';
import { Button } from 'flowbite-react';
import { FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import TemplateModal from '@/app/components/TemplateModal';
import ApplyForm from '../ApplyForm';

export default function SavedPostsPage() {
    const [posts, setPosts] = useState<{ saved: SavedPost; job: JobPost }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

    useEffect(() => {
        async function fetchSavedPosts() {
            try {
                const saved = await savedPosts();
                console.log("Saved posts response:", saved); // Debugging log
    
                if (!Array.isArray(saved)) {
                    setPosts([]);
                    return;
                }
    
                const jobPosts = await Promise.all(
                    saved.map(async (savedPost: SavedPost) => {
                        const job = await getJobPostById(savedPost.jobPostId);
                        return { saved: savedPost, job };
                    })
                );
                setPosts(jobPosts);
            } catch (error) {
                console.error("Error fetching saved posts:", error);
            } finally {
                setLoading(false);
            }
        }
    
        fetchSavedPosts();
    }, []);

    const handleRemove = async (jobPostId: string) => {
        try {
            await saveJobPost(jobPostId);
            setPosts((prevPosts) => prevPosts.filter(({ saved }) => saved.jobPostId !== jobPostId));
            toast.success('Job post removed from saved list!');
        } catch (error) {
            toast.error('An error occurred while removing the job post.');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6">
            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-10">
                    <img 
                        src="/no-data.svg" 
                        alt="No saved jobs" 
                        className="w-60 h-60"
                    />
                    <p className="text-gray-600 text-lg mt-4">You haven't saved any jobs yet.</p>
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-bold mb-4">Saved Job Posts</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posts.map(({ saved, job }) => (
                            <div 
                                key={saved.jobPostId} 
                                className="border p-4 rounded-lg hover:shadow-md hover:bg-gray-100 transition-shadow duration-100 flex flex-col h-full"
                            >
                                <Link href={`/jobposts/details/${job.id}`} className="flex-grow">
                                    <h2 className="text-lg font-semibold">{job.title}</h2>
                                    <p className="text-gray-600">{job.employer}</p>
                                    <p className="text-sm">{new Date(saved.savedAt).toLocaleDateString()} {new Date(saved.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-gray-700">{job.description?.substring(0, 100)}...</p>
                                    <p className="text-green-600 font-bold">${job.paymentAmount}</p>
                                    <p className="text-gray-500">Category: {job.category}</p>
                                </Link>
                                {/* Buttons container - Sticks to the bottom */}
                                <div className="flex justify-between mt-4">
                                    <Button
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setShowModal(true);
                                        }}
                                        className="w-full h-12 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex justify-center items-center"
                                    >
                                        Apply
                                    </Button>
                                    <Button
                                        onClick={() => handleRemove(saved.jobPostId)}
                                        className="ml-2 w-12 h-12 rounded-lg bg-gray-500 hover:bg-gray-600 text-white flex justify-center items-center"
                                        title="Delete Job Post"
                                    >
                                        <FaTrash size={18} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {showModal && selectedJob && (
                <TemplateModal 
                    show={showModal} 
                    onClose={() => setShowModal(false)}
                    title="Apply Form"
                >
                    <ApplyForm jobPostId={selectedJob.id} isSaved={true} />
                </TemplateModal>
            )}
        </div>
    );
}

