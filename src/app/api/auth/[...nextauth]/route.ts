import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma"; // Adjust path to your prisma file

export const authOptions: NextAuthOptions = {
  // 1. Plug in Prisma to save users to your database
  adapter: PrismaAdapter(prisma) as any,
  
  // 2. Define our Login Methods
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hello@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // If user doesn't exist or registered via Google (no password)
        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        // Compare the hashed password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return user as any; 
      }
    })
  ],

  // 3. Configure Session & JWT
  session: {
    strategy: "jwt", // Required when using CredentialsProvider
  },
  callbacks: {
    // Inject the user's role into the session so we can check if they are an admin/seller later!
    async jwt({ token, user }) {
      // 'user' is only passed in the very first time the user logs in
      if (user) {
        token.role = (user as any).role || "customer"; // Fallback safety
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Map the token properties safely back to the client session object
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // We built a custom beautiful login page here
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };