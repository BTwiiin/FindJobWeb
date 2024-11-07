import React from 'react';
import './JobPostCard.css';
import { JobPost } from '@/types';

type Props = {
  jobPost: JobPost;
};

export default function JobPostCard({ jobPost }: Props) {
  return (
    <div className="job-card">
      <div className="job-header">
        <img src="favicon.ico" alt={`${jobPost.title} Logo`} className="company-logo" />
      </div>
      <div className="job-details">
        <h2>{jobPost.title}</h2>
        <p className="payment">{jobPost.paymentAmount ? jobPost.paymentAmount : 'Undisclosed Salary'}</p>
      </div>
      <div className="job-details">
        <p className="deadline">
          Apply by: <span>{jobPost.deadline}</span>
        </p>
        <div className="job-category">
          Category: <span>{jobPost.category}</span>
        </div>
      </div>
    </div>
  );
}

