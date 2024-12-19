import React from 'react';
import Link from 'next/link';
import { CiLocationOn } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { JobPost } from '@/types';
import { useJobHoverStore } from '@/app/hooks/useJobHoverStore';
import { TbPigMoney } from "react-icons/tb";

type Props = {
  jobPost: JobPost;
};

export default function JobPostCard({ jobPost }: Props) {
  const setHoveredJobPostId = useJobHoverStore((state) => state.setHoveredJobPostId);

  const deadline = new Date(jobPost.deadline);
  const createdAt = new Date(jobPost.createdAt);
  const now = new Date();
  const diffTime = now.getTime() - createdAt.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Color the deadline icon based on how old the post is
  let deadlineColorClass = 'text-red-600';
  if (diffDays > 7) deadlineColorClass = 'text-green-600';
  else if (diffDays <= 7 && diffDays >= 1) deadlineColorClass = 'text-yellow-600';

  const isNew = diffDays < 2;

  // Construct a formatted location string by filtering out empty fields
  const locationParts = [
    jobPost.location?.city,
    jobPost.location?.district,
    jobPost.location?.street
  ].filter(Boolean);
  const locationString = locationParts.join(', ');

  return (
    <Link
      href={`/jobposts/details/${jobPost.id}`}
      className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg p-4 m-1 w-full shadow-sm hover:shadow-md transition-shadow duration-200"
      onMouseEnter={() => setHoveredJobPostId(jobPost.id)}
      onMouseLeave={() => setHoveredJobPostId(null)}
    >
      {/* Left Section: Logo and Primary Info */}
      <div className="flex md:items-center md:w-1/4 mb-4 md:mb-0 md:mr-4">
        <img
          src="favicon.ico"
          alt={`Company logo for ${jobPost.title}`}
          className="w-14 h-14 rounded object-cover mr-3"
        />
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight">
            {jobPost.title}
          </h2>
          <div className="flex items-center mt-1">
            <TbPigMoney className="text-green-600" aria-hidden="true" />
            <p className="text-sm text-green-700 font-medium">
              {jobPost.paymentAmount ? `${jobPost.paymentAmount}$` : 'Undisclosed'}
            </p>
            {isNew ? (
              <span className="ml-2 inline-block bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                New
              </span>
            ) : (
              <span className="ml-2 inline-block bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded-full">
                {diffDays}d
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Deadline, Location and Category */}
      <div className="flex flex-col md:flex-row md:justify-between md:flex-1">
        <div className="flex flex-col md:mr-4">
          <div className="flex items-center mb-2">
            <IoTimeOutline className={`mr-2 text-base ${deadlineColorClass}`} aria-hidden="true" />
            <p className={`text-sm ${deadlineColorClass}`}>
              {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          <div className="flex items-center">
            <CiLocationOn className="mr-2 text-base text-gray-600" aria-hidden="true" />
            {locationString ? (
              <p className="text-sm text-gray-700">{locationString}</p>
            ) : (
              <p className="text-sm text-gray-500">Location not provided</p>
            )}
          </div>
        </div>

        <div className="flex items-center md:items-start mt-2 md:mt-0">
          <span className="inline-block bg-blue-100 text-blue-600 text-sm font-medium px-2 py-1 rounded-full">
            {jobPost.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
