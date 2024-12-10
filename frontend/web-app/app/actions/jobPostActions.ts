'use server'

import { auth } from '@/auth';
import { fetchWrapper } from '@/lib/fetchWrapper';
import { JobPost, PagedResult } from '@/types';

export async function getData(query: string): Promise<PagedResult<JobPost>> {
    console.log(query);
    return fetchWrapper.get(`search${query}`);
}

export async function updateJobTest() {
    const data = {
        mileage: Math.floor(Math.random() * 10000) + 1
    }
    const session = await auth();
    const res = await fetch('http://localhost:6001/jobpost/ac8c6f4a-37f6-4e57-97f2-7cb49932745a', {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + session?.accessToken
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) return {status: res.status, message: res.statusText}
    return res.statusText;
}