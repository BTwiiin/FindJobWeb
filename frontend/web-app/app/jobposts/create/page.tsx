import Heading from '@/app/components/Heading'
import React from 'react'
import JobPostForm from '../JobPostForm'

export default function Create() {
  return (
    <div className='mx-auto max-w-[75%] shadow-lg p-10 bg-white rounded-lg mt-3'>
      <Heading title='Create Job Post' subtitle="Please, enter the details of your job" />
      <JobPostForm />
    </div>
  )
}
