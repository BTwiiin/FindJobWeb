'use client'

import React, { useEffect, useState } from 'react'
import JovPostCard from './cards/JobPostCard'
import qs from 'query-string';
import { getData } from '@/app/actions/jobPostActions';
import { useParamsStore } from '@/app/hooks/useParamsStore';
import { useShallow } from 'zustand/shallow';
import { PagedResult, JobPost } from '@/types';
import EmptyFilter from '../components/EmptyFilter';
import Loading from './Loading';




export default function Listings() {
  const [data, setData] = useState<PagedResult<JobPost>>();  // Set state to store fetched data
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

  const setParams = useParamsStore(state => state.setParams);

  const url = qs.stringifyUrl({
    url: '',
    query: params
  });

  useEffect(() => {
      getData(url).then(data => {
          setData(data);
      })
  }, [url]);

  if (!data) {
    return (
      <Loading />
    );
  }

  if (data.results.length === 0) return <EmptyFilter />;

  return (
    <div className="flex flex-wrap">
    {data && data.results.map((jobpost) => (
      <JovPostCard jobPost={jobpost} key={jobpost.id} />
    ))}
  </div>
)
}
