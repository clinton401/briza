"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import {unauthorized_error} from "@/lib/variables";
export const getHomePagePosts = async (page = 1) => {

    const session = await getServerUser();
    if(!session) return {
        error: unauthorized_error,
        success: undefined,
        data: undefined
    }
    const userId = session.id;
    const pageSize = 20;
    const currentPage = Math.max(1, Number(page) || 1);
    const offset = (currentPage - 1) * pageSize;
    // console.log({currentPage, offset})
  
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
                    blueCheckVerified: true
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
          }));
      
          return {
            success: true,
            error: null,
            data: {
              posts: formattedPosts,
              totalPosts,
              totalPages: Math.ceil(totalPosts / pageSize),
              currentPage,
            },
          }
    } catch (error) {
      console.error("Error fetching posts:", error);
      return {
        success: false,
        error: "Unable to fetch posts",
        data: undefined
      };
    }
  };