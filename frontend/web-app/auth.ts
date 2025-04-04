import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                identifier: { label: "Email или имя пользователя", type: "text" },
                password: { label: "Пароль", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await fetch('http://localhost:3001/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: credentials?.identifier,
                            password: credentials?.password,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Authentication failed');
                    }

                    const data = await response.json();
                    
                    return {
                        id: data.id,
                        email: data.email,
                        username: data.username,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: data.role,
                        name: `${data.firstName} ${data.lastName}`,
                        phoneNumber: data.phoneNumber,
                        location: data.location,
                        about: data.about,
                        taxNumber: data.taxNumber,
                        accessToken: data.token,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        authorized: async ({ auth }) => {
            return !!auth
        },
        
        async jwt({ token, user }) {
            if (user) {
                if (user.id) token.id = user.id;
                token.accessToken = user.accessToken;
                token.username = user.username;
                token.role = user.role;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.phoneNumber = user.phoneNumber;
                token.location = user.location;
                token.about = user.about;
                token.taxNumber = user.taxNumber;
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                if (token.id) session.user.id = token.id;
                session.user.username = token.username;
                session.user.role = token.role;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.phoneNumber = token.phoneNumber;
                session.user.location = token.location;
                session.user.about = token.about;
                session.user.taxNumber = token.taxNumber;
                session.accessToken = token.accessToken;
            }
            return session;
        },

        redirect({ url, baseUrl }) {
            if (url.startsWith('/') || 
                url.startsWith('http://localhost:3000') || 
                url.startsWith('http://192.168.0.15:3000')) {
                return url;
            }
            return baseUrl;
        },
    }
})