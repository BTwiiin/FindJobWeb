'use client'

import React, { useEffect, useState } from 'react'
import JovPostCard from './JobPostCard'
import qs from 'query-string';
import { getData } from '@/app/actions/jobPostActions';
import { useParamsStore } from '@/app/hooks/useParamsStore';
import { useShallow } from 'zustand/shallow';
import { PagedResult, JobPost } from '@/types';



export default function Listings() {
  const [data, setData] = useState<PagedResult<JobPost>>();  // Set state to store fetched data
  const params = useParamsStore(useShallow(state => ({
      searchTerm: state.searchTerm,
      searchValue: state.searchValue,
      orderBy: state.orderBy,
      filterBy: state.filterBy
  })));

  const setParams = useParamsStore(state => state.setParams);

  const url = qs.stringifyUrl({
    url: '',
    query: {
        searchTerm: params.searchTerm,
        searchValue: params.searchValue,
        orderBy: params.orderBy,
        filterBy: params.filterBy
    }
  });

  useEffect(() => {
      getData(url).then(data => {
          setData(data);
      })
  }, [url]);

  if (!data) return <h3>Loading...</h3>;
  if (data.results.length === 0) return <h3>No results found</h3>;

    return (
    <div>
      {data && data.results.map((jobpost) => (
        <JovPostCard jobPost={jobpost} key={jobpost.id}/>
      ))}
    </div>
  )
}
