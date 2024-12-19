import { JobPost } from '@/types';
import React from 'react'
import Link from 'next/link';
import { useJobHoverStore } from '@/app/hooks/useJobHoverStore';

type Props = {
  jobPost: JobPost;
};

export default function MapJobPostCard({ jobPost }: Props) {
  return (
    <Link
      href={`/jobposts/details/${jobPost.id}`}
      className="block text-sm font-medium text-gray-800 hover:text-blue-500 transition hover:scale-105"
    >
      {jobPost.title} <br />
      <span className="text-green-600">Payment: ${jobPost.paymentAmount}</span>
    </Link>
  )
}
