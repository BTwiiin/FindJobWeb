// pages/user-profile/UserProfile.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '@/app/actions/authActions';
import { getMyRequests } from '@/app/actions/jobPostActions';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaPhone, FaLocationArrow, FaBriefcase } from 'react-icons/fa';
import Calendar from './Calendar';
import { JobPostRequest } from '@/types';
import { useJobPostStore } from '../hooks/useJobPostStore';

interface User {
    id: string;
    email: string;
    name: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobRequests, setJobRequests] = useState<JobPostRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const jobPosts = useJobPostStore((state) => state.jobPosts);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser() as User;
        if (userData) {
          setUser(userData);
          const requests = await getMyRequests();
          setJobRequests(requests);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {

      }
    };

    fetchUserData();
  }, []);


  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-8">User not found</div>;
  }

  return (
        <div className="flex flex-col md:flex-row fixed h-screen w-screen">
          {/* User Profile Section */}
          <div className="flex-none md:w-1/3 p-4 overflow-y-auto hide-scrollbar pb-32">
            <div className="flex flex-col items-center">
              <img
                src="/user-icon.png"
                alt="User Avatar"
                className="rounded-full w-32 h-32 object-cover mb-4"
              />
              <h1 className="text-2xl font-semibold text-gray-800">{user.name}</h1>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <FaPhone className="mr-2 text-gray-600" />
                <p className="text-gray-600">Phone</p>
              </div>
              <div className="flex items-center mb-4">
                <FaEnvelope className="mr-2 text-gray-600" />
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div className="flex items-center mb-4">
                <FaLocationArrow className="mr-2 text-gray-600" />
                <p className="text-gray-600">Location</p>
              </div>
              <div className="flex items-center mb-4">
                <FaUser className="mr-2 text-gray-600" />
                <p className="text-gray-600">Bio</p>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={() => router.push('/edit-profile')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Edit Profile
              </button>
            </div>
            {/* Recent Job Requests Section */}
            {jobRequests.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Job Requests</h3>
                <ul className="space-y-4">
                    {jobRequests.map((request) => {
                        // Find the matching job post by comparing IDs
                        const jobPost = jobPosts.find((post) => post.id === request.jobPostId);

                        return (
                        <li key={request.id} className={`bg-gray-100 p-4 rounded-lg ${jobPost ? 'hover:bg-gray-300 hover:cursor-pointer' : ''}`} onClick={() => jobPost && router.push(`jobposts/details/${request.jobPostId}`)}>
                          <div className="flex items-center justify-between">
                            <div>
                              {/* Display the job title if jobPost is found */}
                              <p className="text-gray-800 font-semibold">
                              {jobPost ? jobPost.title : 'Job Post was deleted or not found'}
                              </p>
                              <p className="text-gray-600 text-sm">
                              Applied on: {new Date(request.applyDate).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600 text-sm">Status: {request.status}</p>
                            </div>
                          </div>
                        </li>
                        );
                    })}
                    </ul>
              </div>
            )}
          </div>

          {/* Weekly Calendar Section */}
          <div className="flex-shrink md:w-2/3 flex flex-col overflow-hidden">
            <Calendar />
          </div>
        </div>
  );
};

export default UserProfile;