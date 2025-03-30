import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { calculatePagination, calculateNextPage } from "@/lib/random-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let query = searchParams.get("query");
    const filter = searchParams.get("filter")?.toLowerCase() || "latest";
    const page = Number(searchParams.get("page")) || 1;

   
    const session = await getServerUser();
    if (!session) {
      return NextResponse.json(
        { error: unauthorized_error, success: false, data: undefined },
        { status: 401 }
      );
    }
    query = query ? decodeURIComponent(query) : "";
    
    if (!query || query.length < 1) {
        return NextResponse.json(
            { error: "Query is required and must be of minimum length of 1" },
            { status: 400 }
        );
    }

    const userId = session.id;
    const { pageSize, currentPage, offset } = calculatePagination(Number(page));
    let whereCondition: any = {
        content: { contains: query, mode: "insensitive" },
      };
  
      // **Sorting Logic**
      let orderByCondition: any[] = [{ createdAt: "desc" }];
      if (filter === "top") {
        orderByCondition = [
          { metrics: { likesCount: "desc" } },
          { createdAt: "desc" },
        ];
      }
  
    
      let formatResponse = true;
      let selectFields: any = {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        updatedAt: true,
        isEdited: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            profilePictureUrl: true,
            blueCheckVerified: true,
            createdAt: true,
            followers: {
              where: { followerId: userId },
              select: { id: true, followingId: true },
            },
          },
        },
        metrics: true,
        media: {
          select: {
            id: true,
            mediaUrl: true,
            mediaType: true,
            mediaPublicId: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId },
          select: { id: true },
        },
      };
  
      if (filter === "media") {
        whereCondition.media = { some: {} };
        // selectFields = {
        //   id: true,
        //   media: true,
        //   metrics: true,
        // };
        formatResponse = false; 
      }
  
      // **Fetch Data**
      const [totalPosts, posts] = await prisma.$transaction([
        prisma.post.count({ where: whereCondition }),
        prisma.post.findMany({
          where: whereCondition,
          select: selectFields,
          orderBy: orderByCondition,
          take: pageSize,
          skip: offset,
        }),
      ]);

    
      const formattedPosts = posts.map((post) => {
        return{           ...post,
            hasLiked: post.likes.length > 0,
            hasBookmarked: post.bookmarks.length > 0,
            isFollowing: (post.user as any)?.followers?.some((follow: any) => follow.followingId === (post.user as any)?.id) ?? false
      } 

          })
       ;
      const pages = calculateNextPage(currentPage, totalPosts, pageSize);

      return NextResponse.json({
        posts: formattedPosts,
        totalPosts: totalPosts,
        currentPage,
        ...pages,
      });
  } catch (error) {
    console.error("Error fetching searched posts:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
