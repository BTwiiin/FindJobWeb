"use server"

import { fetchWrapper } from "@/lib/fetchWrapper"
import { Review } from "@/types"
import { revalidatePath } from "next/cache"

export async function createReview(jobApplicationId: string, rating: number, comment: string) {
  try {
    const response = await fetchWrapper.post(`reviews/job/${jobApplicationId}`, {
      rating,
      comment,
    })
    revalidatePath("/my-posts")
    return response;
  } catch (error) {
    console.error("Error creating review:", error)
    throw error;
  }
}

export async function getAlreadyReviewed(): Promise<string[]> {
  return await fetchWrapper.get(`reviews/already-reviewed`)
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  return await fetchWrapper.get(`reviews/user/${userId}`)
}

export async function markJobAsCompleted(jobApplicationId: string) {
  return await fetchWrapper.post(`reviews/job/${jobApplicationId}/complete`, {})
} 