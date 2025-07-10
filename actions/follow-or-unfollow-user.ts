"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limits";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";
const followError = (error: string) => {
  return { error, success: false };
};
export const followOrUnfollowUser = async (
  value: boolean,
  followingId: string
) => {
  const session = await getServerUser();
  if (!session) {
    return followError(unauthorized_error);
  }
  if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
    return followError("Your account has been blocked due to multiple violations.");
  }

  const rateLimitResult = rateLimit(session.id, true, { maxRequests: 15 });
  if (rateLimitResult.error) {
    console.warn(`Rate limit exceeded for user ${session.id}`);
    return followError(rateLimitResult.error);
  }
  const followerId = session.id;
  if(followingId === followerId) {
    return followError("You cannot follow yourself.")
  }
  try {
    await prisma.$transaction(async (tx) => {
      if (!value) {
        const follow = await tx.follow.findFirst({
          where: {
            followingId,
            followerId,
          },
          select: {
            id: true,
          },
        });

        if (!follow) {
            throw new Error("Follow not found");

        }

        await tx.follow.delete({
          where: { id: follow.id },
        });

        const metricsFollower = await tx.userMetrics.findUnique({
          where: { userId: followerId },
        });
        const metricsFollowing = await tx.userMetrics.findUnique({
          where: { userId: followingId },
        });

        if (
          metricsFollower &&
          metricsFollower?.followingCount &&
          metricsFollower?.followingCount > 0
        ) {
          await tx.userMetrics.update({
            where: { userId: followerId },
            data: {
              followingCount: { decrement: 1 },
            },
          });
        }
        if (
          metricsFollowing &&
          metricsFollowing?.followersCount &&
          metricsFollowing?.followersCount > 0
        ) {
          await tx.userMetrics.update({
            where: { userId: followingId },
            data: {
              followersCount: { decrement: 1 },
            },
          });
        }
      } else {
        const existingFollow = await tx.follow.findFirst({
          where: {
            followingId,
            followerId,
          },
          select: {
            id: true,
          },
        });

        if (existingFollow) {
            throw new Error("Already followed this user");

        }

        await tx.follow.create({
          data: { followingId, followerId },
        });

        await tx.userMetrics.upsert({
            where: { userId: followerId },
            create: { followingCount: 1 },
            update: { followingCount: { increment: 1 } },
          });
  
          await tx.userMetrics.upsert({
            where: { userId: followingId },
            create: { followersCount: 1 },
            update: { followersCount: { increment: 1 } },
          });

        const existingNotification = await tx.notification.findFirst({
          where: {
            type: "FOLLOW",
            url: `/user/${followingId}`,
            triggeredById: session.id,
            userId: followerId,
          },
        });

        if (!existingNotification && followingId !== session.id) {
          await tx.notification.create({
            data: {
              type: "FOLLOW",
              url: `/user/${followingId}`,
              triggeredById: session.id,
              userId: followingId,
            },
          });
        }
      }
    });
    return {
        success: true,
        error: undefined,
      };
  } catch (error) {
    console.error(`Unable to follow/unfollow user: ${error}`);
    return followError(unknown_error)
  }
};
