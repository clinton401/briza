import { prisma } from "@/lib/db";

export const createVerificationToken = async (
  userId: string,
  token: string,
  expiresAt: Date
) => {
  try {
    // const token = String(code);
    const emailVerification = await prisma.emailVerification.upsert({
      where: {
        userId,
      },
      update: {
        token,
        expiresAt,
      },
      create: {
        token,
        expiresAt,
        userId,
      },
    });
    return emailVerification;
  } catch (error) {
    console.error("Error creating or updating email verification:", error);

    return null;
  }
};

export const findUnique = async (userId: string) => {
  try {
    const userExists = await prisma.emailVerification.findUnique({
      where: {
        userId
      },
    });

    return userExists;
  } catch (error) {
    console.error(`Unable to fetch verification token unique status: ${error}`);

    return null;
  }
};
export const deleteById = async (id: string) => {
    try {
      const deletedUser = await prisma.emailVerification.delete({
        where: {
          id: id,
        },
      });
      return deletedUser;
    } catch (error) {
      
        console.error("Error deleting token:", error);
      
      return null;
    }
  };
  
