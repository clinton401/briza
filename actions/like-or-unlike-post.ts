"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limits";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";

export const likeOrUnlikePost = async (value: boolean, postId: string, postOwnerId: string) => {
  const session = await getServerUser();
  if (!session) {
    return {
      error: unauthorized_error,
      success: false,
    };
  }
  if (session.suspendCount && session.suspendCount >=  MAX_SUSPEND_COUNT) {
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
            postId: postId,
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

        const metrics = await tx.postMetrics.findUnique({
          where: { postId },
        });

        if (metrics && metrics?.likesCount && metrics?.likesCount > 0) {
          await tx.postMetrics.update({
            where: { postId },
            data: {
              likesCount: { decrement: 1 },
            },
          });
        }
      } else {
        const existingLike = await tx.like.findFirst({
          where: {
            userId: session.id,
            postId,
          },
          select: {
            id : true
          }
        });
        if (existingLike) {
          throw new Error("Already liked this post");
        }

        await tx.like.create({
          data: { userId: session.id, postId, likeType: "POST" },
        });

        await tx.postMetrics.upsert({
          where: { postId },
          create: { postId, likesCount: 1 },
          update: { likesCount: { increment: 1 } },
        });

        const existingNotification = await tx.notification.findFirst({
          where: {
            type: "LIKE", 
            url: `/status/${postId}`, 
            triggeredById: session.id, 
            userId: postOwnerId, 
          },
        });
      
        if (!existingNotification && postOwnerId !== session.id) {
          await tx.notification.create({
            data: {
              type: "LIKE",
              url: `/status/${postId}`,
              triggeredById: session.id,
              userId: postOwnerId,
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
    console.error(`Error liking/unliking post: ${err}`);
    return {
      success: false,
      error: unknown_error,
    };
  }
};
