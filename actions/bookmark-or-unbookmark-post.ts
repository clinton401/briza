"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limits";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";

export const bookmarkOrUnbookmarkPost = async (value: boolean, postId: string) => {
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
        const bookmark = await tx.bookmark.findFirst({
          where: {
            userId: session.id,
            postId: postId,
          },
          select: {
            id: true,
          },
        });

        if (!bookmark) {
          return {
            success: false,
            error: "Bookmark not found",
          };
        }

        await tx.bookmark.delete({
          where: { id: bookmark.id },
        });

        const metrics = await tx.postMetrics.findUnique({
          where: { postId },
        });

        if (metrics && metrics?.bookmarksCount && metrics?.bookmarksCount > 0) {
          await tx.postMetrics.update({
            where: { postId },
            data: {
              bookmarksCount: { decrement: 1 },
            },
          });
        }
      } else {
        const existingbookmark = await tx.bookmark.findFirst({
          where: {
            userId: session.id,
            postId,
          },
        });

        if (existingbookmark) {
          return {
            success: false,
            error: "Already bookmarkd this post",
          };
        }

        await tx.bookmark.create({
          data: { userId: session.id, postId },
        });

        await tx.postMetrics.upsert({
          where: { postId },
          create: { postId, bookmarksCount: 1 },
          update: { bookmarksCount: { increment: 1 } },
        });

      
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
