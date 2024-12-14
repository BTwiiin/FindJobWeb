import Heading from '@/app/components/Heading';
import React from 'react'
import JobPostForm from '../../JobPostForm';
import { getJobPostById } from '@/app/actions/jobPostActions';

export default async function Update(props: {params: {id: string}}) {
  const params = await props.params;
  const data = await getJobPostById(params.id);
  return (
    <div>
      <Heading title='Update Job Post' subtitle='Please provide updates to the form'/>
      <JobPostForm jobPost={data} />
    </div>
  )
}

