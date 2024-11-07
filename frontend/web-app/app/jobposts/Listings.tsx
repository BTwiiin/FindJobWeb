import React from 'react'
import JovPostCard from './JobPostCard'
import { JobPost, PagedResult } from '@/types';

async function getData(): Promise<PagedResult<JobPost>> {
    const res = await fetch('http://localhost:6001/search?pageSize=10');

    if (!res.ok) throw new Error('Failed to fetch job posts');

    return res.json();
}

export default async function Listings() {
    const data = await getData();

    return (
    <div>
      {data && data.results.map((jobpost) => (
        <JovPostCard jobPost={jobpost} key={jobpost.id}/>
      ))}
    </div>
  )
}
