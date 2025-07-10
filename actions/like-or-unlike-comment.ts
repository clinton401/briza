"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limits";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";

export const likeOrUnlikeComment = async (value: boolean, commentId: string, commentOwnerId: string, postId: string) => {
  const session = await getServerUser();
  if (!session) {
    return {
      error: unauthorized_error,
      success: false,
    };
  }
  if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
    return { error: "Your account has been blocked due to multiple violations.", success: false };
  }

  const rateLimitResult = rateLimit(session.id, true, { maxRequests: 15 });
  if (rateLimitResult.error) {
    console.warn(`Rate limit exceeded for user ${session.id}`);
    return {
      error: rateLimitResult.error,
      success: false,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (!value) {
        const like = await tx.like.findFirst({
          where: {
            userId: session.id,
            commentId,
          },
          select: {
            id: true,
          },
        });

        if (!like) {
          throw new Error("like not found");

        }

        await tx.like.delete({
          where: { id: like.id },
        });

        const metrics = await tx.commentMetrics.findUnique({
          where: { commentId },
        });

        if (metrics && metrics?.likesCount && metrics?.likesCount > 0) {
          await tx.commentMetrics.update({
            where: { commentId },
            data: {
              likesCount: { decrement: 1 },
            },
          });
        }
      } else {
        const existingLike = await tx.like.findFirst({
          where: {
            userId: session.id,
            commentId,
          },
          select: {
            id : true
          }
        });
        if (existingLike) {
          throw new Error("Already liked this post");
        }

        await tx.like.create({
          data: { userId: session.id, commentId, likeType: "COMMENT" },
        });

        await tx.commentMetrics.upsert({
          where: { commentId },
          create: { commentId, likesCount: 1 },
          update: { likesCount: { increment: 1 } },
        });

        const existingNotification = await tx.notification.findFirst({
          where: {
            type: "LIKE_COMMENT", 
            url: `/status/${postId}`, 
            triggeredById: session.id, 
            userId: commentOwnerId, 
          },
        });
      
        if (!existingNotification && commentOwnerId !== session.id) {
          await tx.notification.create({
            data: {
              type: "LIKE_COMMENT",
              url: `/status/${postId}`,
              triggeredById: session.id,
              userId: commentOwnerId,
            },
          });
        }
      
      }
    });

    return {
      success: true,
      error: undefined,
    };
  } catch (err) {
    console.error(`Error liking/unliking comment: ${err}`);
    return {
      success: false,
      error: unknown_error,
    };
  }
};
