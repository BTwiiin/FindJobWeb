'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';
import { JobPost, PagedResult } from '@/types';
import { revalidatePath } from 'next/cache';
import { List } from 'postcss/lib/list';
import { FieldValues } from 'react-hook-form';

/* #####################################
   ## Job Post Management Actions   ##
   ##################################### */

export async function createJobPost(data: FieldValues) {
    return await fetchWrapper.post(`jobpost`, data);
}

export async function getJobPostById(id: string): Promise<JobPost> {
    return await fetchWrapper.get(`jobpost/${id}`);
}

export async function getData(query: string): Promise<PagedResult<JobPost>> {
    console.log(query);
    return fetchWrapper.get(`search${query}`);
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

/* #####################################
   ## Image Management Actions      ##
   ##################################### */

export async function uploadImages(id: string, formData: FormData) {
    return await fetchWrapper.postFormData(`jobpost/upload-image/${id}`, formData);
}

export async function deleteImage(key: string, id: string) {
    return await fetchWrapper.del(`jobpost/delete-image/${key}/${id}`);
}

export async function getImages(id: string): Promise<string[]> {
    return await fetchWrapper.get(`jobpost/get-image/${id}`);
}

/* #####################################
   ## Application Actions           ##
   ##################################### */

export async function applyToJobPost(jobPostId: string, data: FieldValues) {
    try {
        const response = await fetchWrapper.post(`apply?jobPostId=${jobPostId}`, data);
        
        if (response.error) {
            return { status: response.status, error: { message: response.error.message || 'An error occurred' } };
        }
        revalidatePath(`/jobposts/details/${jobPostId}`);

        return { status: 200, message: 'Application submitted successfully' };
    } catch (error) {
        console.error('Error applying to job post:', error);
        return { status: 500, error: { message: 'An unexpected error occurred' } };
    }
}

export async function updateApplicationStatus(jobPostId: string, username: string, status: number) {
    console.log(jobPostId, username, status);
    
    revalidatePath(`/jobposts/details/${jobPostId}`);

    const res = await fetchWrapper.put(
        `apply/update-status/${jobPostId}/${username}`, 
        { status }
    );

    revalidatePath(`/jobposts/details/${jobPostId}`);
    return res;
}

/* #####################################
   ## Saved Job Post Actions        ##
   ##################################### */

export async function saveJobPost(jobPostId: string) {
    revalidatePath(`/jobposts/details/${jobPostId}`);
    return await fetchWrapper.post(`jobpost/save/${jobPostId}`, {});
}

export async function savedPosts() {
    return await fetchWrapper.get(`jobpost/saved`);
}

/* #####################################
   ## Additional Actions            ##
   ##################################### */

export async function updateJobTest() {
    const data = {
        paymentAmount: Math.floor(Math.random() * 10000) + 1
    }
    
    return await fetchWrapper.put(`jobpost/2b7c99a6-2723-45cb-a445-acbc6a9aaa71`, data);
}

export async function getSimilarJobPosts(category: string): Promise<JobPost[]> {
    const response = await fetchWrapper.get(`search?filterBy=${category}&pageSize=4`);
    return response && response.results ? response.results : [];
}

export async function getMyRequests() {
    return await fetchWrapper.get(`apply/my-requests`);
}

export async function getApplicants(jobPostId: string) {
    return await fetchWrapper.get(`apply/${jobPostId}`);
}
