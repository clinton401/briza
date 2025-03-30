import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { calculatePagination, calculateNextPage } from "@/lib/random-utils";
import type { PostWithDetails } from "@/lib/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const filter = searchParams.get("filter")?.toLowerCase();
    const session = await getServerUser();

    if (!session) {
      return NextResponse.json({ error: unauthorized_error }, { status: 401 });
    }

    const { pageSize, currentPage, offset } = calculatePagination(Number(page));

    let totalCountQuery;
    let postsQuery;

    if (filter === "likes") {
      [totalCountQuery, postsQuery] = await prisma.$transaction([
        prisma.like.count({ where: { userId } }),
        prisma.like.findMany({
          where: { userId },
          include: {
            post: {
              include: {
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
                  where: { userId: session.id },
                  select: { id: true },
                },
                bookmarks: {
                  where: { userId: session.id },
                  select: { id: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip: offset,
        }),
      ]);

      postsQuery = postsQuery.map((like) => like.post);
    } else if (filter === "bookmarks") {
      [totalCountQuery, postsQuery] = await prisma.$transaction([
        prisma.bookmark.count({ where: { userId } }),
        prisma.bookmark.findMany({
          where: { userId },
          include: {
            post: {
              include: {
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
                  where: { userId: session.id },
                  select: { id: true },
                },
                bookmarks: {
                  where: { userId: session.id },
                  select: { id: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip: offset,
        }),
      ]);

      postsQuery = postsQuery.map((bookmark) => bookmark.post);
    } else {
      [totalCountQuery, postsQuery] = await prisma.$transaction([
        prisma.post.count({ where: { userId } }),
        prisma.post.findMany({
          where: { userId },
          include: {
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
              where: { userId: session.id },
              select: { id: true },
            },
            bookmarks: {
              where: { userId: session.id },
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip: offset,
        }),
      ]);
    }
    const validPosts = postsQuery.filter(post => {
      return !!post
    })
    const formattedPosts: PostWithDetails[] = validPosts.map((post) => ({

      ...post,
      hasLiked: post.likes.length > 0,
      hasBookmarked: post.bookmarks.length > 0,
      isFollowing: post.user.followers.some((follow: { followingId: string }) => follow.followingId === post.user.id),
    }));

    const pages = calculateNextPage(currentPage, totalCountQuery, pageSize);

    return NextResponse.json({
      posts: formattedPosts,
      totalPosts: totalCountQuery,
      currentPage,
      ...pages,
    });
  } catch (error) {
    console.error("Error in GET /api/users/[id]/posts:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
