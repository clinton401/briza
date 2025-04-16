import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { calculatePagination, calculateNextPage } from "@/lib/random-utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerUser();
    if (!session) {
      return NextResponse.json({ error: unauthorized_error }, { status: 401 });
    }

    const userId = session.id;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const { pageSize, currentPage, offset } = calculatePagination(Number(page));

    const [totalCount, conversations] = await prisma.$transaction([
      prisma.conversation.count({
        where: {
          userStatuses: {
            some: {
              userId,
              isDeleted: false, // Exclude deleted conversations
            },
          },
        },
      }),

      prisma.conversation.findMany({
        where: {
          userStatuses: {
            some: {
              userId,
              isDeleted: false,
            },
          },
        },
        include: {
          // userStatuses: {
          //   where: { userId },
          //   select: { isDeleted: true, isRead: true, isBlocked: true },
          // },
          userStatuses: {
            select: {
              userId: true,
              isDeleted: true,
              isRead: true,
              isBlocked: true,
            },
          },
          
          user1: {
            select: { id: true, profilePictureUrl: true, username: true, blueCheckVerified: true, bio: true, createdAt: true,  name: true },
          },
          user2: {
            select: { id: true, profilePictureUrl: true, username: true, blueCheckVerified: true, bio: true, createdAt: true,  name: true },
          },
        },
        
        orderBy: { lastMessageAt: "desc" },
        take: pageSize,
        skip: offset,
      }),
    ]);

    // const formattedConversations = conversations.map((conversation) => {
    //   const user = conversation.user1.id === userId ? conversation.user2 : conversation.user1;
    //   const userStatus = conversation.userStatuses[0];

    //   return {
    //     id: conversation.id,
    //     user,
    //     isDeleted: userStatus.isDeleted,
    //     isRead: userStatus.isRead,
    //     isBlocked: userStatus.isBlocked,
    //     lastMessage: conversation.lastMessage,
    //     lastMessageAt: conversation.lastMessageAt,
    //     updatedAt: conversation.updatedAt,
    //   };
    // });

    const formattedConversations = conversations.map((conversation) => {
      const isUser1 = conversation.user1.id === userId;
      const user = isUser1 ? conversation.user2 : conversation.user1;
    
      const userStatus = conversation.userStatuses.find(status => status.userId === userId);
      const otherUserStatus = conversation.userStatuses.find(status => status.userId !== userId);
    
      return {
        id: conversation.id,
        user,
        isDeleted: userStatus?.isDeleted,
        isRead: userStatus?.isRead,
        isBlocked: userStatus?.isBlocked,
        blockedByOtherUser: otherUserStatus?.isBlocked ?? false,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        updatedAt: conversation.updatedAt,
      };
    });
    

    const pages = calculateNextPage(currentPage, totalCount, pageSize);

    return NextResponse.json({
      conversations: formattedConversations,
      totalConversations: totalCount,
      currentPage,
      ...pages,
    });
  } catch (error) {
    console.error("Error in GET /api/conversations:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
