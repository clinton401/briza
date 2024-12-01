import { prisma } from "@/lib/db";
import {genPasswordHash} from "@/lib/password-utils"
import {hasAtLeastOneProperty} from "@/lib/random-utils";
type UpdateUserData = {
    username?: string | null;
    name?: string;
    email?: string;
    bio?: string | null;
    profilePictureUrl?: string | null;
    profilePicturePublicId?: string | null;
    coverPhotoUrl?: string | null;
    coverPhotoPublicId?: string | null;
    website?: string | null;
    websiteName?: string | null;
    isActive?: boolean;
    verifiedDate?: Date | null;
    isVerified?: boolean;
    isSuspended?: boolean;
    suspendCount?: number;
    suspendedDate?: Date | null;
    suspendReason?: string | null;
    lastLogin?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    googleId?: string | null;
    twoFactorAuthentication?: boolean;
  };
  

export const findUnique = async(value: string, isId = false) => {

    try{
        let userExists;
        if(!isId){
            userExists = await prisma.user.findUnique({
                where: {
                    email: value
                }
            });
        } else {
            userExists = await prisma.user.findUnique({
                where: {
                    id: value
                }
            });
        }
         

        return userExists;

    }catch(error){
        console.error(`Unable to fetch user email unique status: ${error}`);

        return null;
    }

}

export const createUser = async (name: string, email: string, password?: string, extraData?: Partial<Omit<UpdateUserData, "name" | "email">>) => {
    try {
      const hashedPassword = password ? await genPasswordHash(password) : undefined;
  
     
      const result = await prisma.$transaction(async (tx) => {
        // Create the user first
        const newUser = await tx.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            ...(hashedPassword && { password: hashedPassword }),
            ...(extraData && extraData),
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
  
       
        await tx.userMetrics.create({
          data: {
            userId: newUser.id, // Link metrics to the newly created user
          },
        });
  
        return newUser;
      });
  
      return result;
    } catch (error) {
      console.error(`Unable to create user: ${error}`);
      return null;
    }
  };
  
export const updateUser = async (userId: string, data: UpdateUserData) => {
    try {
        const isObjectWithAProperty = hasAtLeastOneProperty(data);
        if(!data || !isObjectWithAProperty) {
            throw new Error("Object cannot be empty.")
        }
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
      });
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error
    }
  };

  export const updatePassword = async(userId: string, password: string) => {
    try{
        const hashedPassword = await genPasswordHash(password);
        const updatedUser = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                password: hashedPassword
            },
            select: {
                id: true,
                email: true
            }
        });
        return updatedUser;

    } catch(error){
        console.error(`Unable to update user password: ${error}`);
        return null
    }
  }