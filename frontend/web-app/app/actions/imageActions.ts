'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';

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