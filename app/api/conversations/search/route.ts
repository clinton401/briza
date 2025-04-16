import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { calculatePagination, calculateNextPage } from "@/lib/random-utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let query = searchParams.get("query");
    const filter = searchParams.get("filter")?.toLowerCase() || "people";
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
        { error: "Query is required and must be at least 1 character long" },
        { status: 400 }
      );
    }

    const userId = session.id;
    const { pageSize, currentPage, offset } = calculatePagination(page);

    if (filter === "people") {
      const [totalConversations, conversations] = await prisma.$transaction([
        prisma.conversation.count({
          where: {
            userStatuses: {
              some: { userId, isDeleted: false },
            },
          },
        }),
        prisma.conversation.findMany({
          where: {
            userStatuses: {
              some: { userId, isDeleted: false },
            },
          },
          include: {
            user1: true,
            user2: true,
          },
          orderBy: { updatedAt: "desc" },
          take: pageSize,
          skip: offset,
        }),
      ]);

      const filteredConversations = conversations
        .map((conversation) => {
          const otherUser =
            conversation.user1Id === userId ? conversation.user2 : conversation.user1;

          return otherUser.name.includes(query) || otherUser?.username?.includes(query) 
            ? {
                id: conversation.id,
                user: {
                  id: otherUser.id,
                  name: otherUser.name,
                  username: otherUser.username,
                  bluecheckVerified: otherUser.blueCheckVerified,
                  profilePictureUrl: otherUser.profilePictureUrl,
                },
              }
            : null;
        })
        .filter(Boolean);

      const pages = calculateNextPage(currentPage, totalConversations, pageSize);

      return NextResponse.json({
        conversations: filteredConversations,
        totalConversations,
        currentPage,
        ...pages,
      });
    }

    if (filter === "message") {
      const [totalMessages, messages] = await prisma.$transaction([
        prisma.message.count({
          where: {
            content: { contains: query, mode: "insensitive" },
          },
        }),
        prisma.message.findMany({
          where: {
            content: { contains: query, mode: "insensitive" },
          },
          include: {
            conversation: {
              include: {
                user1: true,
                user2: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: pageSize,
          skip: offset,
        }),
      ]);

      const filteredMessages = messages.map((message) => {
        const conversation = message.conversation;
        const otherUser =
          conversation.user1Id === userId ? conversation.user2 : conversation.user1;

        return {
          id: message.id,
          content: message.content,
          conversationId: message.conversationId,
          createdAt: message.createdAt,
          user: {
            id: otherUser.id,
            name: otherUser.name,
            username: otherUser.username,
            bluecheckVerified: otherUser.blueCheckVerified,
            profilePictureUrl: otherUser.profilePictureUrl,
          },
        };
      });

      const pages = calculateNextPage(currentPage, totalMessages, pageSize);

      return NextResponse.json({
        messages: filteredMessages,
        totalMessages,
        currentPage,
        ...pages,
      });
    }

    return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching convo search results:", error);
    return NextResponse.json({ error: unknown_error }, { status: 500 });
  }
}
