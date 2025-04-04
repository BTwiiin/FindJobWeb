'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';
import { JobPost, PagedResult } from '@/types';
import { revalidatePath } from 'next/cache';
import { FieldValues } from 'react-hook-form';
import { getCurrentUser } from './authActions';

/* #####################################
   ## Job Post Management Actions   ##
   ##################################### */

export async function createJobPost(data: FieldValues) {
    return await fetchWrapper.post(`job-posts`, data);
}

export async function getJobPostById(id: string): Promise<JobPost> {
    return await fetchWrapper.get(`job-posts/${id}`);
}

export async function getData(query: string): Promise<PagedResult<JobPost>> {
    console.log(query);
    return fetchWrapper.get(`search${query}`);
}

export async function updateJobPost(data: FieldValues, id: string) {
    const res = await fetchWrapper.put(`jobpost/${id}`, data);
    revalidatePath(`/job-posts/${id}`);
    return res;
}

export async function deleteJobPost(id: string) {
    const res = await fetchWrapper.del(`job-posts/${id}`);
    revalidatePath(`/`);
    return res;
}

export async function getMyJobPosts() {
    return await fetchWrapper.get(`job-posts/my-posts`);
}

export async function archiveJobPost(id: string) {
    return await fetchWrapper.put(`job-posts/archive/${id}`, {});
}

/* #####################################
   ## Image Management Actions      ##
   ##################################### */

export async function uploadImages(id: string, formData: FormData) {
    return await fetchWrapper.postFormData(`images/upload/${id}`, formData);
}

export async function deleteImage(key: string, id: string) {
    return await fetchWrapper.del(`/images/job-post/${key}/${id}`);
}

export async function getImages(id: string): Promise<any> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/job-post/${id}`, {
      cache: 'no-store'
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

/* #####################################
   ## Application Actions           ##
   ##################################### */

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

/* #####################################
   ## Saved Job Post Actions        ##
   ##################################### */

export async function saveJobPost(jobPostId: string) {
    revalidatePath(`/jobposts/details/${jobPostId}`);
    return await fetchWrapper.post(`jobpost/save/${jobPostId}`, {});
}

export async function savedPosts() {
    return await fetchWrapper.get(`job-posts/saved`);
}

/* #####################################
   ## Additional Actions            ##
   ##################################### */

export async function getSimilarJobPosts(category: string): Promise<JobPost[]> {
    const response = await fetchWrapper.get(`search?filterBy=${category}&pageSize=4`);
    return response && response.results ? response.results : [];
}

// Test function - consider removing in production
export async function updateJobTest() {
    const data = {
        paymentAmount: Math.floor(Math.random() * 10000) + 1
    }
    
    return await fetchWrapper.put(`jobpost/2b7c99a6-2723-45cb-a445-acbc6a9aaa71`, data);
}

export async function getMyRequests() {
    return await fetchWrapper.get(`apply`);
}

export async function getApplicants() {
    return await fetchWrapper.get(`apply`);
}

export async function updateUserProfile(userId: string, data: any) {
  try {
    // Get the current session to access the token
    const session = await getCurrentUser();
    
    if (!session) {
      throw new Error('User not authenticated');
    }
    
    // Map frontend property names to backend property names
    const backendData = {
      ...data,
      phoneNumber: data.phoneNumber, // Map phoneNumber to phone for backend
    };
    
    // Remove phoneNumber from the data if it exists to avoid duplication
    if (backendData.phoneNumber) {
      delete backendData.phoneNumber;
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    // Get the updated user data from the response
    const updatedUser = await response.json();
    console.log("Backend returned updated user:", updatedUser);
    
    // Return only the fields that are part of the session object
    const sessionFields = {
      phoneNumber: updatedUser.phone, // Map phone back to phoneNumber for frontend
      about: updatedUser.about,
      location: updatedUser.location ? {
        country: updatedUser.location.country,
        city: updatedUser.location.city,
        street: updatedUser.location.street,
        latitude: Number(updatedUser.location.latitude),
        longitude: Number(updatedUser.location.longitude),
      } : null,
      profilePicture: updatedUser.profilePicture,
    };
    
    console.log("Returning session fields:", sessionFields);
    return sessionFields;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
