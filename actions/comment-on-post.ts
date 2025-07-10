"use server";

import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limits";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";
const commentError = (error: string) => ({
  error,
  success: false,
  data: null,
});

export const commentOnPost = async (
  content: string,
  postId: string,
  postOwnerId: string,
) => {
  // Get the user session
  const session = await getServerUser();
  if (!session) {
    return commentError(unauthorized_error);
  }

  if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
    return commentError(
      "Your account has been blocked due to multiple violations.",
    );
  }
  if (content.trim().length < 1) {
    return commentError(
      "Your comment must contain at least one letter or character."
    );
  }


  const rateLimitResult = rateLimit(session.id, true, { maxRequests: 30 });
  if (rateLimitResult.error) {
    console.warn(`Rate limit exceeded for user ${session.id}`);
    return commentError(rateLimitResult.error);
  }

  const userId = session.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({ where: { id: postId } });
      if (!post) {
        throw new Error("Post not found or has been deleted.");
      }

      const comment = await tx.comment.create({
        data: {
          content,
          postId,
          userId,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,

          parentCommentId: true,
          user: {
            select: {
              id: true,
              name: true,
              profilePictureUrl: true,
              bio: true,
              username: true,
              createdAt: true,
              blueCheckVerified: true,
              followers: {
                where: {
                  followerId: userId,
                },
                select: { id: true, followingId: true },
              },
            },
          },
        },
      });
      await tx.postMetrics.upsert({
        where: { postId },
        create: { postId, commentsCount: 1 },
        update: { commentsCount: { increment: 1 } },
      });
      const metrics = await tx.commentMetrics.create({
        data: {
          commentId: comment.id,
          likesCount: 0,
          repliesCount: 0,
        },
        select: {
          id: true,
          repliesCount: true,
          likesCount: true
        }
      });
      if (postOwnerId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            url: `/status/${postId}`,
            triggeredById: userId,
            userId: postOwnerId,
          },
        });
      }

      return { ...comment, metrics };
    });
    const formattedResponse = {
      ...result,
      hasLiked: false,


    };
    return {
      error: null,
      success: true,
      data: formattedResponse,
    };
  } catch (error) {
    console.error(`Error commenting on post: ${error}`);
    return commentError(unknown_error);
  }
};
