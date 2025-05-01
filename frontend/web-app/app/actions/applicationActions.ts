'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';
import { FieldValues } from 'react-hook-form';
import { revalidatePath } from 'next/cache';
import { getOrCreateApplicationChat } from './chatActions';

export async function applyToJobPost(jobPostId: string, data: FieldValues) {
    try {
        const response = await fetchWrapper.post('apply', {
            ...data,
            jobPostId
        });
        
        if (response.error) {
            return { status: response.status, error: { message: response.error.message || 'Произошла ошибка' } };
        }
        
        // Create a chat immediately after successful application
        try {
            await getOrCreateApplicationChat(
                response.id, // Assuming the API returns the application ID
                'Спасибо за отклик на вакансию! Вы можете обсудить детали работы здесь.'
            );
        } catch (error) {
            console.error('Error creating chat for application:', error);
            // Don't fail the whole operation if chat creation fails
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
    
    // Chat is now created when candidate applies, not when accepted
    
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