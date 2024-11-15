import { prisma } from "@/lib/db";

export const createTwoFAToken = async (
  userId: string,
  token: string,
  expiresAt: Date
) => {
  try {
    // const token = String(code);
    const twoFA = await prisma.twoFA.upsert({
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
    return twoFA;
  } catch (error) {
    console.error("Error creating or updating two factor verification:", error);

    return null;
  }
};

export const findUnique = async (userId: string) => {
  try {
    const userExists = await prisma.twoFA.findUnique({
      where: {
        userId
      },
    });

    return userExists;
  } catch (error) {
    console.error(`Unable to fetch two factor token unique status: ${error}`);

    return null;
  }
};
export const deleteById = async (id: string) => {
    try {
      const deletedUser = await prisma.twoFA.delete({
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
  
