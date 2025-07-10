

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
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
    // googleId?: string;
    twoFactorAuthentication?: boolean;
    blueCheckVerified: boolean;
    
    isPasswordAvailable?: boolean;
    } & DefaultSession["user"];
  }
}
