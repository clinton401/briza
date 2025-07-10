"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { rateLimit } from "@/lib/rate-limits";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";

const deletePostError = (error: string) => ({
  error,
  success: false,
});

export const deletePost = async (postId: string) => {
  const session = await getServerUser();
  if (!session) return deletePostError(unauthorized_error);
  if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
    return deletePostError("Your account has been blocked due to multiple violations.");
  }

  const { error } = rateLimit(session.id, true);
  if (error) return deletePostError(error);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.post.delete({
        where: { id: postId },
      });

      const userMetrics = await tx.userMetrics.findUnique({
        where: { userId: session.id },
      });

      if (userMetrics && userMetrics.postCount && userMetrics.postCount > 0) {
        await tx.userMetrics.update({
          where: { userId: session.id }, 
          data: { postCount: { decrement: 1 } },
        });
      }
    });

    return { success: true, error: undefined };
  } catch (error) {
    console.error(`Unable to delete post: ${error}`);
    return deletePostError(unknown_error);
  }
};
