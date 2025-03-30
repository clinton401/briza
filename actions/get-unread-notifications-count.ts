"use server";
import { prisma } from "@/lib/db";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import { threeResponse } from "@/lib/random-utils";


export const getUnreadNotificationsCount = async () => {

    const session = await getServerUser();
    if (!session) return threeResponse(unauthorized_error);
    const userId = session.id
    try {
        const unreadCount = await prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
        return {
            success: true,
            error: undefined,
            data: {
                count: unreadCount
            }
        }

    } catch (error) {
        console.error(`Unable to get unread notifications count: ${error}`);
        return threeResponse(unknown_error);
    }

}