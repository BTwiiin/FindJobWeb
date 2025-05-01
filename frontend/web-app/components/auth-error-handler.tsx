'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthErrorHandlerProps {
    error: any;
}

export function AuthErrorHandler({ error }: AuthErrorHandlerProps) {
    const router = useRouter();

    useEffect(() => {
        if (error?.isUnauthorized) {
            signOut({ redirect: true, callbackUrl: '/auth/login' });
        }
    }, [error]);

    return null;
} 