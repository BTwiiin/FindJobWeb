'use client'

import React, { useEffect, useState } from 'react'
import JovPostCard from './cards/JobPostCard'
import qs from 'query-string';
import { getData } from '@/app/actions/jobPostActions';
import { useParamsStore } from '@/app/hooks/useParamsStore';
import { useShallow } from 'zustand/shallow';
import EmptyFilter from '../components/EmptyFilter';
import Loading from './Loading';
import { useJobPostStore } from '../hooks/useJobPostStore';
import OrderBy from './OrderBy';

export default function Listings() {
  const [loading, setLoading] = useState(true);
  const params = useParamsStore(useShallow(state => ({
      searchTerm: state.searchTerm,
      pageSize: state.pageSize,
      searchValue: state.searchValue,
      orderBy: state.orderBy,
      filterBy: state.filterBy,
      employer: state.employer,
      minSalary: state.minSalary,
      maxSalary: state.maxSalary
  })));

  const data = useJobPostStore(useShallow(state => ({
    jobPosts: state.jobPosts,
    totalCount: state.totalCount,
  })));

  const setData = useJobPostStore(state => state.setData);

  const url = qs.stringifyUrl({
    url: '',
    query: params
  });

  useEffect(() => {
      getData(url).then(data => {
          setData(data);
          setLoading(false);
      })
  }, [url]);

  if (loading) {
    return (
      <Loading />
    );
  }

  if (data.jobPosts.length === 0) return <EmptyFilter />;

  return (
    <div className="flex flex-col">
      {data && (
        <><div className="sticky top-0 z-20 bg-white shadow-md">
            <div className="flex items-center justify-between px-4 py-2">
              <h1 className="text-xl font-semibold text-gray-600">Job Offers: {data.totalCount}</h1>
              <OrderBy />
            </div>
          </div>
          <div className="flex flex-wrap pb-32">
            {data.jobPosts.map((jobpost) => (
              <JovPostCard jobPost={jobpost} key={jobpost.id} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
