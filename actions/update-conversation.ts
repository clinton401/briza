"use server";
import { prisma } from "@/lib/db";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import {MAX_SUSPEND_COUNT} from "@/lib/auth-utils";


export const updateConversation = async (id: string, key: "isBlocked" | "isDeleted", value: boolean) => {

    try {
        // const {isBlocked, isDeleted} = data;
        const session = await getServerUser();
        if (!session) return unauthorized_error;
        if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
            return "Your account has been blocked due to multiple violations.";
        }

        const userId = session.id;
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                OR: [
                    { user1Id: userId },
                    { user2Id: userId },
                ],
            },
            select: { id: true },
        });
        if (!conversation) return "Conversation not found or access denied";
        const userStatus = await prisma.conversationUserStatus.findFirst({
            where: {
                conversationId: id,
                userId,
            },
        });
        if (!userStatus) return "User status not found or access denied";
        if (userStatus[key] === value) return "Already updated";

        await prisma.conversationUserStatus.updateMany({
            where: {
                conversationId: id,
                userId
            },
            data: {
                [key]: value
            }
        })
        return null
    } catch (error) {
        console.error(`Unable to update conversation: ${error}`);
        return unknown_error
    }
}