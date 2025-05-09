"use server";
// export  const revalidate = async() => 300;
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { unknown_error, unauthorized_error } from "@/lib/variables";
export const getUsersNotFollowedByCurrentUser = async () => {
  try {
    const session = await getServerUser();
    if (!session)
      return {
        error: unauthorized_error,
        users: undefined,
      };
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.id } },

          {
            NOT: {
              followers: {
                some: {
                  followerId: session.id,
                },
              },
            },
          },

          { isVerified: true },
          { bio: { not: null } },
          { name: { not: undefined } },
          { username: { not: null } },
          { profilePictureUrl: { not: null } },
        ],
      },
      take: 6,
      select: {
        id: true,
        username: true,
        name: true,
        profilePictureUrl: true,
        profilePicturePublicId: true,
        bio: true,
        blueCheckVerified: true,
        createdAt: true,
      },
    });
    const formattedUsers = users.map((user) => {
      return { ...user, hasFollowed: false };
    });
    return { error: undefined, users: formattedUsers };
  } catch (err) {
    console.error(
      `Error trying to get users not being followed by current user: ${err}`
    );
    return {
      error: unknown_error,
      users: undefined,
    };
  }
};
