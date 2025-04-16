import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params:  Promise<{ id: string }> }
) {
  try {
    const session = await getServerUser();
    if (!session) {
      return NextResponse.json({ error: unauthorized_error }, { status: 401 });
    }

    const userId = session.id;
    const {id: conversationId} = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        userStatuses: {
          select: { userId: true, isDeleted: true, isRead: true, isBlocked: true },
        },
        user1: {
          select: {
            id: true,
            profilePictureUrl: true,
            username: true,
            blueCheckVerified: true,
            bio: true,
            createdAt: true,
            name: true,
          },
        },
        user2: {
          select: {
            id: true,
            profilePictureUrl: true,
            username: true,
            blueCheckVerified: true,
            bio: true,
            createdAt: true,
            name: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.user1.id !== userId && conversation.user2.id !== userId) {
      return NextResponse.json({ error: "You are not part of this conversation" }, { status: 403 });
    }

    const isUser1 = conversation.user1.id === userId;
    const user = isUser1 ? conversation.user2 : conversation.user1;

    const userStatus = conversation.userStatuses.find((status) => status.userId === userId);
    const otherUserStatus = conversation.userStatuses.find((status) => status.userId !== userId);

    const formattedConversation = {
      id: conversation.id,
      user,
      isDeleted: userStatus?.isDeleted ?? false,
      isRead: userStatus?.isRead ?? false,
      isBlocked: userStatus?.isBlocked ?? false,
      blockedByOtherUser: otherUserStatus?.isBlocked ?? false,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      updatedAt: conversation.updatedAt,
    };

    return NextResponse.json(formattedConversation);
  } catch (error) {
    console.error("Error in GET /api/conversations/:id:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
