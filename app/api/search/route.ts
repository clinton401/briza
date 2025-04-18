import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { calculatePagination, calculateNextPage } from "@/lib/random-utils";
import {Prisma} from "@prisma/client"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let query = searchParams.get("query");
    const filter = searchParams.get("filter")?.toLowerCase() || "latest";
    const page = Number(searchParams.get("page")) || 1;

    // **Get Logged-in User**
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
        { error: "Query is required and must be at least 1 character long" },
        { status: 400 }
      );
    }

    const userId = session.id;
    const { pageSize, currentPage, offset } = calculatePagination(page);

    // **Handle "People" Filter**
    if (filter === "people") {
      const [totalUsers, users] = await prisma.$transaction([
        prisma.user.count({
          where: {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } }
            ],
            profilePictureUrl: { not: null },
            profilePicturePublicId: { not: null },
            bio: { not: null },
          },
        }),
        prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } }
            ],
            profilePictureUrl: { not: null },
            profilePicturePublicId: { not: null },
            bio: { not: null },
          },
          select: {
            id: true,
            username: true,
            name: true,
            profilePictureUrl: true,
            profilePicturePublicId: true,
            bio: true,
            createdAt: true,
            blueCheckVerified: true,
            followers: {
              where: { followerId: userId },
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip: offset,
        }),
      ]);
      

      // **Format Response**
      const formattedUsers = users.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl,
        profilePicturePublicId: user.profilePicturePublicId,
        bio: user.bio,
        createdAt: user.createdAt,
        blueCheckVerified: user.blueCheckVerified,
        hasFollowed: user.followers.length > 0, // If there's a record, the user is followed
      }));

      const pages = calculateNextPage(currentPage, totalUsers, pageSize);

      return NextResponse.json({
        users: formattedUsers,
        totalUsers,
        currentPage,
        ...pages,
      });
    }

    const whereCondition: Prisma.PostWhereInput = {
      content: { contains: query, mode: "insensitive" },
    };

    let orderByCondition: Prisma.Enumerable<Prisma.PostOrderByWithRelationInput> = [{ createdAt: "desc" }];
    if (filter === "top") {
      orderByCondition = [
        { metrics: { likesCount: "desc" } },
        { createdAt: "desc" },
      ];
    }

    const selectFields = {
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
      (whereCondition as {media : {}}).media = { some: {} };
    }

    // **Fetch Posts**
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

    const formattedPosts = posts.map((post) => ({
      ...post,
      hasLiked: post.likes.length > 0,
      hasBookmarked: post.bookmarks.length > 0,
      isFollowing:
        (post.user as { id: string, followers: {followingId: string}[]})?.followers?.some(
          (follow) => follow.followingId === post.user?.id
        ) ?? false,
    }));

    const pages = calculateNextPage(currentPage, totalPosts, pageSize);

    return NextResponse.json({
      posts: formattedPosts,
      totalPosts,
      currentPage,
      ...pages,
    });
  } catch (error) {
    console.error("Error fetching search results:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
