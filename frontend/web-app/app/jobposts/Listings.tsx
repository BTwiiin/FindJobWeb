import React from 'react'
import JovPostCard from './JobPostCard'

async function getData() {
    const res = await fetch('http://localhost:6001/search');

    if (!res.ok) throw new Error('Failed to fetch job posts');

    return res.json();
}

export default async function Listings() {
    const data = await getData();

    return (
    <div>
      {data && data.results.map((jobpost: any) => (
        <JovPostCard jobpost={jobpost} key={jobpost.id}/>
      ))}
    </div>
  )
}
