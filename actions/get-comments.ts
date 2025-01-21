"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { threeResponse } from "@/lib/random-utils";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { Prisma } from "@prisma/client";

enum Filters {
  LIKES = "LIKES",
  LATEST = "LATEST",
  OLDEST = "OLDEST",
}

export const getComments = async (
  postId: string,
  page = 1,
  filter: Filters = Filters.LIKES
) => {
  const session = await getServerUser();
  if (!session) return threeResponse(unauthorized_error);
  // return threeResponse(unknown_error);
  const userId = session.id;
  const pageSize = 15;
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * pageSize;

  
  const orderBy: Prisma.CommentOrderByWithRelationInput =
    filter === Filters.LIKES
      ? { metrics: { likesCount: "desc" } } 
      : filter === Filters.LATEST
      ? { createdAt: "desc" } 
      : { createdAt: "asc" }; 

  try {
    const [comments, totalComments] = await prisma.$transaction([
      prisma.comment.findMany({
        where: {
          postId,
          parentCommentId: null,
        },
        orderBy,
        skip: offset,
        take: pageSize,
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
      }),
      prisma.comment.count({
        where: {
          postId,
          parentCommentId: null,
        },
      }),
    ]);

    const formattedComments = comments.map((comment) => ({
      ...comment,
      hasLiked: comment.likes && comment.likes.length > 0,
    }));
const totalPages = Math.ceil(totalComments / pageSize);
const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    return {
      success: true,
      error: undefined,
      data: {
        comments: formattedComments,
        totalComments,
        totalPages,
        currentPage,
        nextPage
      },
    };
  } catch (error) {
    console.error(`Unable to get post comments: ${error}`);
    return threeResponse(unknown_error);
  }
};
