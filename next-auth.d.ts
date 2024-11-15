

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username?: string;
    name: string;
    email: string;
    bio?: string;
    profilePictureUrl?: string;
    coverPhotoUrl?: string;
    verifiedDate?: Date;
    isVerified?: boolean;
    isSuspended?: boolean;
    suspendCount?: number;
    suspendedDate?: Date;
    suspendReason?: string;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    googleId?: string;
    twoFactorAuthentication?: boolean;
    
    isPasswordAvailable?: boolean;
    } & DefaultSession["user"];
  }
}
