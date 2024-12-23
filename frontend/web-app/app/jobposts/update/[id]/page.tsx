import Heading from '@/app/components/Heading';
import React from 'react'
import JobPostForm from '../../JobPostForm';
import { getJobPostById } from '@/app/actions/jobPostActions';

export default async function Update(props: {params: {id: string}}) {
  const params = await props.params;
  const data = await getJobPostById(params.id);
  return (
    <div className='mx-auto max-w-[75%] shadow-lg p-10 bg-white rounded-lg mt-3'>
      <Heading title='Update Job Post' subtitle='Please provide updates to the form'/>
      <JobPostForm jobPost={data} />
    </div>
  )
}

