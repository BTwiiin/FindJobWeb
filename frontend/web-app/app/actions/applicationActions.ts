'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';
import { FieldValues } from 'react-hook-form';
import { revalidatePath } from 'next/cache';

export async function applyToJobPost(jobPostId: string, data: FieldValues) {
    try {
        const response = await fetchWrapper.post('apply', {
            ...data,
            jobPostId
        });
        
        if (response.error) {
            return { status: response.status, error: { message: response.error.message || 'Произошла ошибка' } };
        }
        revalidatePath(`/jobposts/details/${jobPostId}`);

        return { status: 200, message: 'Отклик успешно отправлен' };
    } catch (error) {
        console.error('Error applying to job post:', error);
        return { status: 500, error: { message: 'Произошла непредвиденная ошибка' } };
    }
}

export async function updateApplicationStatus(applicationId: string, status: string, employerNotes?: string) {
  try {
    const response = await fetchWrapper.put(`apply/${applicationId}`, { 
      status,
      employerNotes 
    });
    return response;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
}

export async function withdrawApplication(applicationId: string) {
  try {
    const response = await fetchWrapper.put(`apply/withdraw/${applicationId}`, { 
      status: "withdrawn",
      employerNotes: "Withdrawn by employee"
    });
    return response;
  } catch (error) {
    console.error("Error withdrawing application:", error);
    throw error;
  }
}

export async function getMyRequests() {
    return await fetchWrapper.get(`apply`);
}

export async function getApplicants() {
    return await fetchWrapper.get(`apply`);
} 