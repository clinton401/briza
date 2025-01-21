"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import {unauthorized_error, unknown_error} from "@/lib/variables"; 


export const getPost = async(postId: string) => {
    const session = await getServerUser();
    if(!session) return {
        error: unauthorized_error,
        success: false,
        data: undefined
    }
const userId = session.id;
    try {
        
        const post = await prisma.post.findUnique({
            where: { id: postId },
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
          });
      
          if (!post) {
            return {
              success: false,
              error: "The post you're looking for could not be found. It may have been removed or is no longer available.",
              data: undefined,
            };
          }
      
      
          const formattedPost = {
            ...post,
            hasLiked: post.likes.length > 0,
            hasBookmarked: post.bookmarks.length > 0,
            
            isFollowing: post.user.followers.some(
              (follow) => follow.followingId === post.user.id
            ),
          };
          return {
            success: true,
            error: undefined,
            data: formattedPost,
          };

    }catch(error) {
        console.error(`Error fetching post with id ${postId}`, error);
      return {
        success: false,
        error: unknown_error,
        data: undefined
      };
    }
}