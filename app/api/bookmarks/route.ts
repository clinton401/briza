import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { calculatePagination, calculateNextPage } from "@/lib/random-utils";

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
        const page = searchParams.get("page") || "1";

        try{

            const session = await getServerUser();
            if(!session){
                return NextResponse.json({
                    error: unauthorized_error
                }, {
                    status: 401
                })
            }

            const userId = session.id;
            const {pageSize, currentPage, offset} = calculatePagination(Number(page))
            const [bookmarks, totalBookmarks] = await prisma.$transaction([
                prisma.bookmark.findMany({
                    where: {
                        userId,
                    },
    
                    skip: offset,
                    take: pageSize,
                    include: {
                        post: {
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
                                    where: { followerId: userId },
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
                          },
                        
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                prisma.bookmark.count({
                    where: {
                        userId
                    }
                })
            ]);
    
            const formattedBookmarks = bookmarks.map((bookmark) => ({
                ...bookmark,
                post: {
                    ...bookmark.post,
                    hasLiked: bookmark.post.likes.length > 0,
                    hasBookmarked: bookmark.post.bookmarks.length > 0,
                    isFollowing: bookmark.post.user.followers.some(
                      (follow) => follow.followingId === bookmark.post.user.id
                    ),
                }
                
              }));
            
            const pages = calculateNextPage(currentPage, totalBookmarks, pageSize);
            return NextResponse.json({
                bookmarks: formattedBookmarks,
                totalBookmarks,
                currentPage,
                ...pages
            })

        }catch(error) {
            console.error(`Unhandled error in GET /notifications : ${error} `);
            return NextResponse.json({
                error: unknown_error
            }, {
                status: 500
            })
        }
}