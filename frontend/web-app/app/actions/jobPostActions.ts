'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';
import { JobPost, PagedResult } from '@/types';
import { revalidatePath } from 'next/cache';
import { Field, FieldValue, FieldValues } from 'react-hook-form';

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

export async function getJobPostById(id: string): Promise<JobPost> {
    return await fetchWrapper.get(`jobpost/${id}`);
}

export async function getSimilarJobPosts(category: string): Promise<JobPost[]> {
    const response = await fetchWrapper.get(`search?filterBy=${category}&pageSize=4`);
    return response && response.results ? response.results : [];
}

export async function updateJobPost(data: FieldValues, id: string) {
    const res = await fetchWrapper.put(`jobpost/${id}`, data);
    revalidatePath(`/jobposts/${id}`);
    return res;
}

export async function deleteJobPost(id: string) {
    revalidatePath(`/`);
    return await fetchWrapper.del(`jobpost/${id}`);
}

export async function getMyRequests() {
    return await fetchWrapper.get(`apply/my-requests`);
}

export async function applyToJobPost(jobPostId: string, data: FieldValues) {
    revalidatePath(`/jobposts/details/${jobPostId}`);
    return await fetchWrapper.post(`apply?jobPostId=${jobPostId}`, data);
}