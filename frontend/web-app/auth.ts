import NextAuth, { Profile } from "next-auth"
import { OIDCConfig } from "next-auth/providers"
import DuendeIDS6Provider from "next-auth/providers/duende-identity-server6"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: 'jwt'
    },
    providers: [
        DuendeIDS6Provider({
            id: "id-server",
            clientId: "nextApp",
            clientSecret: "NotASecret",
            issuer: "http://localhost:5001",
            authorization: {params: {scope: "openid profile jobApp"}},
            idToken: true
          } as OIDCConfig<Omit<Profile, 'username'>>),
    ],
    callbacks: {
        authorized: async ({ auth }) => {
            return !!auth
        },
        
        async jwt({ token, profile, account}) {
            if (account && account.access_token) {
                token.accessToken = account.access_token
            }

            if (profile) {
                console.log("Received profile:", profile);
                token.username = profile.username,
                token.email = profile.email,
                token.name = profile.name,
                token.role = profile.role,
                token.taxId = profile.tax_number ?? undefined
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.username = token.username
                session.user.role = token.role
                session.user.taxId = token.taxId
                session.accessToken = token.accessToken
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