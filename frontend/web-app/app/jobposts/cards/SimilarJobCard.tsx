import React from 'react';
import { JobPost } from '@/types';
import Link from 'next/link';

type SimilarJobCardProps = {
  jobPost: JobPost;
};

export default function SimilarJobCard({ jobPost }: SimilarJobCardProps) {
  // Compute how many days ago this job was posted
  const createdAt = new Date(jobPost.createdAt);
  const now = new Date();
  const diffTime = now.getTime() - createdAt.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Decide how to label the job as "New" or "Xd ago"
  const jobAgeLabel = diffDays < 7 ? `${diffDays}d New` : `${diffDays}d ago`;

  // Decide text color for the deadline depending on urgency
  const deadlineDate = new Date(jobPost.deadline);
  const deadlineDiff = deadlineDate.getTime() - now.getTime();
  const deadlineDays = deadlineDiff / (1000 * 60 * 60 * 24);
  
  let deadlineColorClass = 'text-green-600'; 
  if (deadlineDays <= 7 && deadlineDays >= 1) deadlineColorClass = 'text-yellow-600';
  if (deadlineDays < 1) deadlineColorClass = 'text-red-600';

  return (
    <Link
      href={`/jobposts/details/${jobPost.id}`}
      className="block p-4 border rounded-lg shadow hover:shadow-md transition-shadow bg-white"
    >
      {/* Top: Employer Logo (if any), Title, and Age Badge */}
      <div className="flex items-center space-x-2 mb-2">
        {/* Placeholder for job/company icon */}
        <img
          src="/favicon.ico"
          alt="Company Logo"
          className="w-8 h-8 rounded-full"
        />
        
        <h3 className="font-semibold text-black truncate flex-1">{jobPost.title}</h3>

        <span className="text-gray-500 text-xs bg-gray-100 rounded-full px-2 py-0.5">
          {jobAgeLabel}
        </span>
      </div>

      {/* Payment */}
      <p className="text-green-600 font-bold">
        Payment: {jobPost.paymentAmount ? `${jobPost.paymentAmount}$` : 'Undisclosed'}
      </p>

      {/* Category */}
      <p className="text-gray-500 text-sm">
        Category: <span className="text-black font-medium">{jobPost.category}</span>
      </p>

      {/* Deadline */}
      <p className={`text-sm ${deadlineColorClass}`}>
        Apply by: {deadlineDate.toLocaleString()}
      </p>
    </Link>
  );
}
