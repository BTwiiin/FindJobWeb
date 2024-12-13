import { getJobPostById, getSimilarJobPosts } from '@/app/actions/jobPostActions';
import Heading from '@/app/components/Heading';
import React from 'react';
import SimilarJobCard from '../../SimilarJobCard';
import { getCurrentUser } from '@/app/actions/authActions';
import EditButton from './EditButton';
import { Button } from 'flowbite-react';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Details(props: Params) {
  const params = await props.params;
  const data = await getJobPostById(params.id);
  const user = await getCurrentUser();

  // TODO: Exclude the current job post from the similar jobs

  const similarJobs = await getSimilarJobPosts(data.category);
  for (const job of similarJobs) {
    if (job.id === data.id) {
      similarJobs.splice(similarJobs.indexOf(job), 1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 bg-white shadow-lg rounded-lg mt-0">
      {/* Page Heading */}
      <Heading title={data.title} subtitle={`Posted by ${data.employer}`} />

      {/* Top Section: Employer & Dates */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4">
        <div className="flex items-center space-x-4">
          {/* You can replace the image source with a company logo or a placeholder icon */}
          <img
            src="/favicon.ico"
            alt="Company Logo"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <p className="text-lg font-medium">{data.employer}</p>
            <p className="text-gray-500 text-sm">
              Posted on: {new Date(data.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-gray-500 text-sm mt-4 md:mt-0">
          Updated: {new Date(data.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Job Description</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {data.description}
        </p>
      </div>

      {/* Details Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-600">Category</h3>
          <p>{data.category}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-600">Payment</h3>
          <p className="text-green-600 font-bold">
            {data.paymentAmount ? `$${data.paymentAmount}` : 'Undisclosed'}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-600">Deadline</h3>
          <p>{new Date(data.deadline).toLocaleDateString()}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-600">Status</h3>
          <p
            className={
              data.status.toLowerCase() === 'open'
                ? 'text-green-600 font-medium'
                : 'text-gray-500 font-medium'
            }
          >
            {data.status}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex space-x-4">
        {/* This could be a link or a Button to apply */}
        <Button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all">
          Apply Now
        </Button>
        {/* Another action, e.g. Save or Share */}
        <Button className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-all">
          Save for Later
        </Button>
        {/* Edit Button */}
        {user?.username === data.employer && (
          <EditButton id={data.id} />
        )}
      </div>

      {/* Similar Jobs Section */}
      {similarJobs && similarJobs.length > 0 && (
        <div className="mt-12 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Similar Jobs</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {similarJobs.map((job) => (
              <SimilarJobCard key={job.id} jobPost={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}