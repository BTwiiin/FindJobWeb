'use server'

import { getCurrentUser } from '@/app/actions/authActions';

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