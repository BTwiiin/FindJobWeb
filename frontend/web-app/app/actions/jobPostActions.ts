'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';
import { JobPost, PagedResult } from '@/types';
import { Field, FieldValue, FieldValues } from 'react-hook-form';
import { data } from 'react-router-dom';

export async function getData(query: string): Promise<PagedResult<JobPost>> {
    console.log(query);
    return fetchWrapper.get(`search${query}`);
}

export async function updateJobTest() {
    const data = {
        paymentAmount: Math.floor(Math.random() * 10000) + 1
    }
    
    return await fetchWrapper.put(`jobpost/2b7c99a6-2723-45cb-a445-acbc6a9aaa71`, data);
}

export async function createJobPost(data: FieldValues) {
    return await fetchWrapper.post(`jobpost`, data);
}