import { NextRequest, NextResponse } from "next/server";
import { followOrUnfollowUser } from "@/actions/follow-or-unfollow-user";
import {prisma} from "@/lib/db";
import { Prisma } from "@prisma/client";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { calculatePagination, calculateNextPage } from "@/lib/random-utils";
import {type NotFollowedUsers} from "@/lib/types";


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string } >}) {
  try {
    const { id } =  await params;
    const result = await followOrUnfollowUser(true, id);
const {error, success} = result
    if ( error || !success) {
      return NextResponse.json({ error: error || unknown_error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in POST /api/users/[id]/follow:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string } >}) {
  try {
    const { id } =  await params;
    const result = await followOrUnfollowUser(false, id);
    const {error, success} = result
    if ( error || !success) {
      return NextResponse.json({ error: error || unknown_error }, { status: 400 });
    }


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/users/[id]/follow:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const filter = searchParams.get("filter")?.toLowerCase();
    const session = await getServerUser();

    if (!session) {
      return NextResponse.json({ error: unauthorized_error }, { status: 401 });
    }

    if (!filter || (filter !== "followers" && filter !== "following")) {
      return NextResponse.json(
        { error: "Invalid filter: use 'followers' or 'following'." },
        { status: 400 }
      );
    }

    const whereCondition =
      filter === "followers" ? { followingId: id } : { followerId: id };

    const { pageSize, offset, currentPage } = calculatePagination(Number(page));

    const [totalUsers, follows] = await prisma.$transaction([
      prisma.follow.count({ where: whereCondition }),

      prisma.follow.findMany({
        where: whereCondition,
        include: {
          follower: filter === "followers"
            ? {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  profilePictureUrl: true,
                  bio: true,
                  createdAt: true,
                  blueCheckVerified: true,
                  profilePicturePublicId: true,
                },
              }
            : false,

          following: filter === "following"
            ? {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  profilePictureUrl: true,
                  bio: true,
                  createdAt: true,
                  blueCheckVerified: true,
                  profilePicturePublicId: true,
                },
              }
            : false,
        },
        skip: offset,
        take: pageSize,
      }),
    ]);

    const users = follows.map((follow) =>
      filter === "followers" ? follow.follower : follow.following
    );

    // Fetch whether each user follows the logged-in user
    const userIds = users.map((user) => user.id);
    const followRelations = await prisma.follow.findMany({
      where: {
        followerId: { in: userIds }, // These users are the followers or following
        followingId: session.id, // Checking if they follow the logged-in user
      },
      select: { followerId: true },
    });

    const followedByLoggedInUser = new Set(
      followRelations.map((relation) => relation.followerId)
    );

    const formattedUsers = users.map((user) => ({
      ...user,
      hasFollowed: followedByLoggedInUser.has(user.id),
    }));

    const pages = calculateNextPage(currentPage, totalUsers, pageSize);

    return NextResponse.json({
      users: formattedUsers,
      totalUsers,
      currentPage,
      ...pages,
    });
  } catch (err) {
    console.error("Error in GET /api/users/[id]/follow:", err);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}

