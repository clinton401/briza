import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { calculatePagination, calculateNextPage } from "@/lib/random-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerUser();
    if (!session) {
      return NextResponse.json({ error: unauthorized_error }, { status: 401 });
    }

    const userId = session.id;
    const { id: conversationId } = await params;

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const { pageSize, currentPage, offset } = calculatePagination(Number(page), 50);

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      select: { id: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 });
    }

    const [totalCount, messages] = await prisma.$transaction([
      prisma.message.count({
        where: {
          conversationId,
          isDeleted: false,
        },
      }),

      prisma.message.findMany({
        where: {
          conversationId,
          isDeleted: false,
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: pageSize,
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          isRead: true,
          senderId: true,
          receiverId: true,
          conversationId: true
        },
      }),
    ]);

    const pages = calculateNextPage(currentPage, totalCount, pageSize);

    return NextResponse.json({
      messages,
      totalMessages: totalCount,
      currentPage,
      ...pages,
    });
  } catch (error) {
    console.error("Error in GET /api/conversations/:id/messages:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const session = await getServerUser();
      if (!session) {
        return NextResponse.json({ error: unauthorized_error }, { status: 401 });
      }
  
      const userId = session.id;
      const { id: conversationId } = await params;
      const body = await req.json();
      const { content } = body;
  
      if (!content || typeof content !== "string" || content.trim().length < 1) {
        return NextResponse.json({ error: "Message content is required" }, { status: 400 });
      }
  
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { user1Id: userId },
            { user2Id: userId },
          ],
        },
        
      });
  
      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 });
      }
  
      const receiverId = conversation.user1Id === userId
        ? conversation.user2Id
        : conversation.user1Id;
  
      const userStatuses = await prisma.conversationUserStatus.findMany({
        where: {
          conversationId,
          userId: { in: [userId, receiverId] },
        },
      });
  
      const senderStatus = userStatuses.find(status => status.userId === userId);
      const receiverStatus = userStatuses.find(status => status.userId === receiverId);
  
      if (senderStatus?.isBlocked) {
        return NextResponse.json({ error: "You have blocked this user" }, { status: 403 });
      }
  
      if (receiverStatus?.isBlocked) {
        return NextResponse.json({ error: "You have been blocked by this user" }, { status: 403 });
      }
  
     
      const message = await prisma.message.create({
        data: {
          content,
          senderId: userId,
          receiverId,
          conversationId,
          isRead: true,
        },
      });
  
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          lastMessageAt: message.createdAt,
        },
      });
  
      await prisma.$transaction([
        prisma.conversationUserStatus.updateMany({
          where: {
            conversationId,
            userId,
          },
          data: {
            isRead: true,
            isDeleted: false,
          },
        }),
        prisma.conversationUserStatus.updateMany({
          where: {
            conversationId,
            userId: receiverId,
          },
          data: {
            isRead: false,
            isDeleted: false,
          },
        }),
      ]);
  
      return NextResponse.json({ message }, { status: 201 });
  
    } catch (error) {
      console.error("Error in POST /api/conversations/:id/messages:", error);
      return NextResponse.json({ error: unknown_error }, { status: 500 });
    }
  }
  