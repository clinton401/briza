"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import {unauthorized_error, unknown_error} from "@/lib/variables";
export const getHomePagePosts = async (page = 1) => {

  
    const session = await getServerUser();
    if(!session) return {
        error: unauthorized_error,
        success: false,
        data: undefined
    }
    const userId = session.id;
    const pageSize = 10;
    const currentPage = Math.max(1, Number(page) || 1);
    const offset = (currentPage - 1) * pageSize;

  
    try {
        const [posts, totalPosts] = await prisma.$transaction([
            prisma.post.findMany({
              where: { audience: "PUBLIC" },
              orderBy: [
                { createdAt: "desc" },
                { id: "asc" }
            ],
              skip: offset,
              take: pageSize,
              include: {
                metrics: true,
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
                media: true,
                likes: {
                  where: { userId, postId: { not: null }, commentId: null },
                  select: { id: true },
                },
                bookmarks: {
                  where: { userId },
                  select: { id: true },
                },
              },
            }),
            prisma.post.count({
              where: { audience: "PUBLIC" },
            }),
          ]);
      
         
          const formattedPosts = posts.map((post) => ({
            ...post,
            hasLiked: post.likes.length > 0,
            hasBookmarked: post.bookmarks.length > 0,
            isFollowing: post.user.followers.some(
              (follow) => follow.followingId === post.user.id
            ),
          }));


          const totalPages = Math.ceil(totalPosts / pageSize);
          const nextPage = currentPage < totalPages ? currentPage + 1 : null;
          return {
            success: true,
            error: null,
            data: {
              posts: formattedPosts,
              totalPosts,
              totalPages,
              currentPage,
              nextPage
            },
          }
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        success: false,
        error: unknown_error,
        data: undefined
      };
    }
  };