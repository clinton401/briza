import { prisma } from "@/lib/db";

export const createResetToken = async (
  userId: string,
  token: string,
  expiresAt: Date
) => {
  try {
    // const token = String(code);
    const passwordReset = await prisma.passwordReset.upsert({
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
    return passwordReset;
  } catch (error) {
    console.error("Error creating or updating reset token:", error);

    return null;
  }
};

export const findUnique = async (userId: string) => {
  try {
    const userExists = await prisma.passwordReset.findUnique({
      where: {
        userId
      },
    });

    return userExists;
  } catch (error) {
    console.error(`Unable to fetch reset token unique status: ${error}`);

    return null;
  }
};
export const deleteById = async (id: string) => {
    try {
      const deletedUser = await prisma.passwordReset.delete({
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
  
