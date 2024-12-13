import React from 'react';
import './JobPostCard.css';
import { JobPost } from '@/types';
import Link from 'next/link';

type Props = {
  jobPost: JobPost;
};

export default function JobPostCard({ jobPost }: Props) {
  const deadline = new Date(jobPost.deadline);
  const createdAt = new Date(jobPost.createdAt);
  const now = new Date();
  
  const diffTime = now.getTime() - createdAt.getTime(); 
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let deadlineColorClass = '';
  
  if (diffDays > 7) {
    deadlineColorClass = 'text-green-600'; 
  } else if (diffDays <= 7 && diffDays >= 1) {
    deadlineColorClass = 'text-yellow-600';
  } else {
    deadlineColorClass = 'text-red-600';
  }

  const isNew = diffDays < 2;

  return (
    <Link href={`/jobposts/details/${jobPost.id}`} className="job-card">

      <div className="job-header">
        <img src="favicon.ico" alt={`${jobPost.title} Logo`} className="company-logo" />
      </div>

      <div className="flex flex-col ml-4 mr-auto">
        <h2 className='flex-initial mb-3 mt-1 font-semibold text-lg text-black'>{jobPost.title}</h2>
        <p className={` mb-1 m-0 p-0  ${deadlineColorClass}`}>
          Apply by: <span>{deadline.toLocaleString()}</span>
        </p>
      </div>

      <div className="job-details mr-auto">
        <div className='flex-row flex align-baseline'>
          <p className="flex-initial pt-1 text-green-600 font-bold mr-2">Payment: {jobPost.paymentAmount ? jobPost.paymentAmount + '$' : 'Undisclosed'}</p>
          {isNew ? (
              <span className="bg-gray-100 text-gray-500 text-sm font-medium px-2 py-1 rounded-full">
                New
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 text-sm font-medium px-2 py-1 rounded-full">{diffDays}d ago</span>
            )}
        </div>
        <div className="job-category">
          Category: <span>{jobPost.category}</span>
        </div>
      </div>
    </Link>
  );
}

