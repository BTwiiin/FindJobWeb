import { auth } from "@/auth";
import { signOut } from "next-auth/react";

const baseUrl = 'http://localhost:3001/';

async function get(url: string) {
    const requestOptions = {
        method: 'GET',
        headers: await getHeaders()
    }

    const response = await fetch(baseUrl + url, requestOptions);

    return handleResponse(response);
}

async function postFormData(endpoint: string, formData: FormData) {
    const headers = await getAuthHeaders(); // Get auth headers

    const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers, 
        body: formData,
    });

    return handleResponse(response);
}

async function post(url: string, body: {}) {
    const requestOptions = {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(body)
    }

    const response = await fetch(baseUrl + url, requestOptions);

    return handleResponse(response);
}

async function put(url: string, body: {}) {
    const requestOptions = {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(body)
    }

    const response = await fetch(baseUrl + url, requestOptions);

    return handleResponse(response);
}

async function del(url: string) {
    const requestOptions = {
        method: 'DELETE',
        headers: await getHeaders()
    }

    const response = await fetch(baseUrl + url, requestOptions);

    return handleResponse(response);
}

async function getHeaders() {
    const session = await auth();
    const headers = {
        'Content-type': 'application/json',
    } as any;

    if(session?.accessToken) {
        headers.Authorization = 'Bearer ' + session.accessToken.trim();
    }

    return headers;
}

async function getAuthHeaders() {
    const session = await auth();
    const headers: Record<string, string> = {};

    if (session?.accessToken) {
        headers.Authorization = 'Bearer ' + session.accessToken.trim();
    }

    return headers;
}

async function handleUnauthorized() {
    // Redirect to login page
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
}

async function handleResponse(response: Response) {
    const text = await response.text();
    console.log(text);

    // Check if the response is valid JSON
    let data;
    try {
        data = text && JSON.parse(text); // Try parsing JSON
    } catch (error) {
        // If not valid JSON, log it and return the raw text
        console.error('Error parsing response as JSON:', error);
        data = { message: text }; // Assign the plain text response to a message property
    }

    if (response.ok) {
        return data || response.statusText;
    } else {
        const error = {
            status: response.status,
            message: data.message || response.statusText // Use message from response if available
        };

        return { error };
    }
}


export const fetchWrapper = {
    get,
    post,
    postFormData,
    put,
    del
};
