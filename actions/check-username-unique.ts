"use server";
import { prisma } from "@/lib/db";

export const checkUsernameUnique = async (username: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    return !!user;
  } catch (error) {
    console.error(`Error checking username uniqueness: ${error}`);
   throw error
  }
};
