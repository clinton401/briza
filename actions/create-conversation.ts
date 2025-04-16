"use server";
import { createNormalError } from "@/lib/random-utils";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { rateLimit } from "@/lib/rate-limits";
import { prisma } from "@/lib/db";

export const createConversation = async (recipientId: string) => {
    const session = await getServerUser();
    if (!session) return createNormalError(unauthorized_error);

    const { error } = rateLimit(session.id, true);
    if (error) return createNormalError(error);

    const senderId = session.id;
    if (!recipientId) return createNormalError("No recipientId provided");
    if (senderId === recipientId) return createNormalError("You can't create a conversation with yourself");

    try {
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: senderId, user2Id: recipientId },
                    { user1Id: recipientId, user2Id: senderId }
                ]
            },
            include: {
                userStatuses: true,
                user1: {
                    select: { id: true, profilePictureUrl: true, username: true, blueCheckVerified: true , bio: true, createdAt: true, name: true },
                },
                user2: {
                    select: { id: true, profilePictureUrl: true, username: true, blueCheckVerified: true , bio: true, createdAt: true, name: true },
                }
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: senderId,
                    user2Id: recipientId,
                    userStatuses: {
                        create: [
                            { userId: senderId, isRead: true },
                            { userId: recipientId },
                            
                        ]
                    }
                },
                include: {
                    userStatuses: true,
                    user1: {
                        select: { id: true, profilePictureUrl: true, username: true, blueCheckVerified: true, bio: true, createdAt: true, name: true },
                    },
                    user2: {
                        select: { id: true, profilePictureUrl: true, username: true, blueCheckVerified: true, bio: true, createdAt: true, name: true },
                    }
                }
            });
        } else {
            await prisma.conversationUserStatus.updateMany({
                where: {
                    conversationId: conversation.id,
                    isDeleted: true,
                    userId: senderId,
                },
                data: { isDeleted: false }
            });
        }

        if (!conversation) return createNormalError(unknown_error);

     
        const userStatus = conversation.userStatuses.find((status) => status.userId === senderId);
        const user = conversation.user1.id === senderId ? conversation.user2 : conversation.user1;

        return {
            data: {
                id: conversation.id,
                user,
                isDeleted: userStatus?.isDeleted || false,
                isRead: userStatus?.isRead || false,
                isBlocked: userStatus?.isBlocked || false,
                lastMessage: conversation.lastMessage,
                lastMessageAt: conversation.lastMessageAt,
                updatedAt: conversation.updatedAt,
            },
            message: "Conversation created successfully",
            error: undefined
        };
    } catch (error) {
        console.error(`Unable to create conversation: ${error}`);
        return createNormalError(unknown_error);
    }
};
