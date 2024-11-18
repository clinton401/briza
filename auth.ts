import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { hasAtLeastOneProperty } from "@/lib/random-utils";
import { findUnique, createUser, updateUser } from "@/data/users";
import { prisma } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Session } from "next-auth";
export const { handlers, signIn, signOut, auth } = NextAuth({
    // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      const lowercaseEmail = user.email?.toLowerCase();
      if (!lowercaseEmail) {
        console.log("User email is missing.");
        return false;
      }
      if (account?.provider === "credentials") {
        const existingUser = await findUnique(lowercaseEmail);
        if (!existingUser || existingUser.isVerified === false || !existingUser.id) return false;
        const dataToBeUpdated = {
            lastLogin: new Date()
        }
        const updatedUser = await updateUser(existingUser.id, dataToBeUpdated);
        if(!updatedUser) return false
        return true;
      }
      if (account?.provider && account.provider !== "credentials") {
        const existingUser = await findUnique(lowercaseEmail);
        
        if (existingUser) {
          const dataToBeUpdated: Partial<{
            isVerified: boolean;
            verifiedDate: Date;
            twoFactorAuthentication: boolean;
            googleId: string;
            lastLogin: Date
          }> = {
            lastLogin: new Date()
          };
          if (existingUser.isVerified === false) {
            dataToBeUpdated.isVerified = true;
            dataToBeUpdated.verifiedDate = new Date();
          }

          if (existingUser.twoFactorAuthentication === true) {
            dataToBeUpdated.twoFactorAuthentication = false;
          }
          if (!existingUser?.googleId) {
            dataToBeUpdated.googleId = account.providerAccountId;
          }
          const isObjectWithAProperty = hasAtLeastOneProperty(dataToBeUpdated);
          if (isObjectWithAProperty) {
            const updatedUser = await updateUser(existingUser.id, dataToBeUpdated);
            if (!updatedUser) return false;
          }
          return true;
        }
        const extraData = {
          isVerified: true,
          verifiedDate: new Date(),
          googleId: account.providerAccountId,
          twoFactorAuthentication: false,
          lastLogin: new Date()
        };
 
        const newUser = await createUser(
            user?.name || "User",
          lowercaseEmail,
          undefined,
          extraData
        );
        if (!newUser) return false;
        return true;
      }

      return true;
    },
    async jwt({ token }) {
      let user;
      if (token.email) {
        user = await findUnique(token.email.toLowerCase());
      } else if (token.sub) {
        
        user = await findUnique(token.sub, true);
      }
      if (user) {
          token.email = user.email
          token.sub = user.id;
          token.name = user.name;
          token.username = user.username;
          token.bio = user.bio;
          token.profilePictureUrl = user.profilePictureUrl
          token.coverPhotoUrl = user.coverPhotoUrl;
          token.verifiedDate = user.verifiedDate;
          token.isVerified = user.isVerified;
          token.isSuspended = user.isSuspended;
          token.suspendCount = user.suspendCount;
          token.suspendedDate = user.suspendedDate;
          token.suspendReason = user.suspendReason;
          token.lastLogin = user.lastLogin;
          token.googleId = user.googleId;
          token.twoFactorAuthentication = user.twoFactorAuthentication;

          token.createdAt = user.createdAt;
          token.updatedAt = user.updatedAt;
          token.isPasswordAvailable = !!user.password;
      }

      return token;
    },
    async session({ token, session }: { session: Session; token: any }) {
        if (!token || !session?.user) return session;
        if(token.email) {
          session.user.email = token.email
        }
        if(token.googleId) {
          session.user.googleId = token.googleId
        }
        if(token.twoFactorAuthentication) {
          session.user.twoFactorAuthentication = token.twoFactorAuthentication
        }
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.lastLogin) {
          session.user.lastLogin = token.lastLogin;
        }
        if (token.suspendReason) {
          session.user.suspendReason = token.suspendReason;
        }
        if (token.suspendedDate) {
          session.user.suspendedDate = token.suspendedDate;
        }
        if (token.isSuspended) {
          session.user.isSuspended = token.isSuspended;
        }
        if (token.suspendCount) {
          session.user.suspendCount = token.suspendCount;
        }
        if (token.isVerified) {
          session.user.isVerified = token.isVerified;
        }
        if (token.verifiedDate) {
          session.user.verifiedDate = token.verifiedDate;
        }
  
        if (token.username) {
          session.user.username = token.username;
        }
  
        if (token.bio) {
          session.user.bio = token.bio;
        }
  
        if (token.profilePictureUrl) {
          session.user.profilePictureUrl = token.profilePictureUrl;
        }
        if (token.coverPhotoUrl) {
          session.user.coverPhotoUrl = token.coverPhotoUrl;
        }
  
        if (token.name) {
          session.user.name = token.name;
        }
  
        if (token.createdAt) {
          session.user.createdAt = token.createdAt;
        }
  
        if (token.updatedAt) {
          session.user.updatedAt = token.updatedAt;
        }
  
        if (token.isPasswordAvailable !== undefined) {
          session.user.isPasswordAvailable = token.isPasswordAvailable;
        }
        return session;
      },
  },
  ...authConfig,
});
