'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';
import { revalidatePath } from 'next/cache';

export async function saveJobPost(jobPostId: string) {
    revalidatePath(`/jobposts/details/${jobPostId}`);
    return await fetchWrapper.post(`jobpost/save/${jobPostId}`, {});
}

export async function savedPosts() {
    return await fetchWrapper.get(`job-posts/saved`);
} 