"use server";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { threeResponse } from "@/lib/random-utils";

export const getNotifications = async (page = 1) => {
    const session = await getServerUser();
    if (!session) return threeResponse(unauthorized_error)
    const userId = session.id;
    const pageSize = 15;
    const currentPage = Math.max(1, Number(page) || 1);
    const offset = (currentPage - 1) * pageSize;
    try {
        const [notifications, totalNotifications] = await prisma.$transaction([
            prisma.notification.findMany({
                where: {
                    userId,
                },

                skip: offset,
                take: pageSize,
                include: {
                    triggeredBy: {
                        select: {
                            id: true,
                            name: true,
                            profilePictureUrl: true,
                            bio: true,
                            username: true,
                            createdAt: true,
                            blueCheckVerified: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.notification.count({
                where: {
                    userId
                }
            })
        ]);


        const totalPages = Math.ceil(totalNotifications / pageSize);
        const nextPage = currentPage < totalPages ? currentPage + 1 : null;
        return {
            success: true,
            error: null,
            data: {
                notifications,
                totalNotifications,
                totalPages,
                currentPage,
                nextPage
            },
        }

    } catch (error) {
        console.error(`Unable to get user's notifications: ${error}`);
        return threeResponse(unknown_error)
    }
}