import { NextResponse } from "next/server";
import getServerUser from "@/hooks/get-server-user";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { prisma } from "@/lib/db";


export async function GET(req: Request, { params }: { params: Promise<{ id: string } >}) {
const{id} = await params;
const session = await getServerUser();
if(!session) {
    return NextResponse.json({
        error: unauthorized_error
    }, {
        status: 401
    })
}
const userId = session.id;

try{
const user = await prisma.user.findUnique({
    where: {
        id
    },
    select: {
        id: true,
        name: true,
        username: true,
        coverPhotoUrl: true,
        website: true,
        websiteName: true,
        blueCheckVerified: true,
        profilePictureUrl: true,
        profilePicturePublicId: true,
        coverPhotoPublicId: true,
        bio: true,
        createdAt: true,
        metrics: {
          select: {
            followersCount: true,
            followingCount: true,
            postCount: true,
          },
        },
      },
})

if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isFollowing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: id,
      },
    },
  });
  return NextResponse.json(
    {
      ...user,
      isFollowing: !!isFollowing, 
    },
    { status: 200 }
  );
}catch(error){
    console.error(`Unhandled error in GET /users/[id] ${error}`);
    
    return NextResponse.json({ error: unknown_error }, { status: 500 });
}
}