import { FC } from "react";
import { UserFollowPage } from "@/components/user/user-follow-page";
import getServerUser from "@/hooks/get-server-user";
import { prisma } from "@/lib/db";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        username: true,
      },
    });

    if (!user) {
      return {
        title: "User Not Found",
        description: "This user does not exist on Briza.",
      };
    }

    return {
      title: `Followers of ${user.name || user.username}`,
      description: `Explore who follows ${
        user.name || user.username
      } on Briza.`,
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return {
      title: "Error Fetching User",
      description:
        "An error occurred while trying to fetch the user details. Please try again later.",
    };
  }
}

const UserFollowersPage: FC = async () => {
  const session = await getServerUser();
  if (!session) return;
  return <UserFollowPage session={session} />;
};

export default UserFollowersPage;
