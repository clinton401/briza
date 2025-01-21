"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { threeResponse } from "@/lib/random-utils";
import { unauthorized_error, unknown_error } from "@/lib/variables";

export const getReplies = async(postId: string, parentCommentId: string) => {
    
  const session = await getServerUser();
  if (!session) return threeResponse(unauthorized_error);
  const userId = session.id;
  try{
    const replies = await  prisma.comment.findMany({
        where: {
          postId,
          parentCommentId,
        },
        orderBy: {
             metrics: { likesCount: "desc" } 
        },
        take: 15,
        select: {
          id: true,
          content: true,
          createdAt: true,
          parentCommentId: true,
          likes: {
            where: { userId, commentId: { not: null }, postId: null },
            select: { id: true },
          },
          metrics: {
            select: {
              id: true,
              likesCount: true,
              repliesCount: true,
            },
          },
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
      const formattedReplies = replies.map((reply) => ({
        ...reply,
        hasLiked: reply.likes && reply.likes.length > 0,
      }));
      return {
        success: true,
        error: undefined,
        data: {
          replies: formattedReplies
        },
      };
  }catch(error) {
    
    
    console.error(`Unable to get comment replies: ${error}`);
    return threeResponse(unknown_error);
  }
}
