'use server'

import { auth } from "@/auth"
import { signIn } from "@/auth"
import { User } from "@/types"

export async function getCurrentUser(): Promise<User | null> {
    try {
        const session = await auth();

        if(!session?.user) return null;
        
        // Check if ID exists
        if (!session.user.id) {
            console.error('User ID is missing from session');
            return null;
        }
        
        return {
            id: session.user.id,
            email: session.user.email as string,
            username: session.user.username as string,
            firstName: session.user.firstName as string,
            lastName: session.user.lastName as string,
            role: session.user.role as string,
            accessToken: session.accessToken,
            phoneNumber: session.user.phoneNumber as string | undefined,
            location: session.user.location as any | undefined,
            about: session.user.about as string | undefined,
            taxNumber: session.user.taxNumber as string | undefined,
        };
    }
    catch(e) {
        console.error(e);
        return null;
    }
}

export async function resendVerificationEmail(email: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to resend verification email")
    }

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || "Failed to resend verification email")
  }
}

export async function registerUser(data: {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  taxNumber?: string
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to register user")
    }

    const user = await response.json()
    return user
  } catch (error: any) {
    throw new Error(error.message || "Failed to register user")
  }
}

export async function loginUser(identifier: string, password: string) { // Rename email to identifier for clarity
  try {
    console.log(`Attempting NextAuth signIn with identifier: ${identifier}`); // Add logging

    // Directly call signIn. NextAuth will trigger the 'authorize' function.
    // Pass the keys defined in your CredentialsProvider ('identifier', 'password').
    await signIn('credentials', {
      identifier, // Use the correct key 'identifier'
      password,
      redirect: false, // Keep redirect false to handle success/error in the form
    });

    console.log(`NextAuth signIn successful for identifier: ${identifier}`);
    // If signIn completes without throwing, the user is logged in.
    // Return a success indicator. The session update happens via callbacks.
    return { success: true };

  } catch (error: any) {
    console.error(`Error during signIn for identifier: ${identifier}`, error);

    // Check specifically for the CredentialsSignin error type thrown by NextAuth on authorize failure
    // Note: The exact error structure might vary slightly across versions, check the console output.
    // Using includes('CredentialsSignin') is often safer.
    if (error.message.includes('CredentialsSignin')) {
        // Provide a user-friendly error for bad credentials or other auth failures from authorize
       throw new Error("Invalid email/username or password."); // More specific error
    } else if (error.message === 'NEXT_REDIRECT') {
        // This specific error code can sometimes be thrown when using redirect:false
        // if there's an issue deeper in the NextAuth flow or routing after sign-in attempt.
        // Often, you might not need to explicitly handle it if the login ultimately fails.
        console.warn("Caught NEXT_REDIRECT error during loginUser, likely benign if login fails.");
        throw new Error("Login failed. Please try again."); // Generic fallback
    }

    // Throw a generic error for other unexpected issues (network errors, etc.)
    throw new Error(error.message || "An unexpected error occurred during login.");
  }
}

export async function getUserByUsername(username: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}`);
        
        if (!res.ok) {
            throw new Error(`Failed to fetch user: ${res.statusText}`);
        }
        
        const userData = await res.json();
        
        // Map the backend response to the frontend model
        return {
            id: userData.id,
            email: userData.email,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role,
            phoneNumber: userData.phone, // Map phone to phoneNumber
            location: userData.location,
            about: userData.about,
            taxNumber: userData.taxNumber,
            createdAt: userData.createdAt,
        };
    } catch (error) {
        console.error('Error fetching user by username:', error);
        throw error;
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to change password")
    }

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || "Failed to change password")
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to request password reset")
    }

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || "Failed to request password reset")
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to reset password")
    }

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || "Failed to reset password")
  }
}

