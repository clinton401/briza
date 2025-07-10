"use server";
import { prisma } from "@/lib/db";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";
import {MAX_SUSPEND_COUNT} from "@/lib/auth-utils";
export const markNotificationsAsRead = async()=> {
    const session = await getServerUser();
    if (!session) {
      return {
        error: unauthorized_error,
        success: undefined
      }
  }
    if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
      return {
        error: "Your account has been blocked due to multiple violations.",
        success: undefined
      }
    }
    const userId = session.id
    try{
      await prisma.notification.updateMany({
            where: {
              userId: userId,
              isRead: false,
            },
            data: {
              isRead: true,
            },
          });
          return {
            success: "Successfully marked notifications as read",
            error: undefined
          }

    }catch(error){
        console.error(`Unable to mark notifications as read: ${error}`);
        return {
            error: unknown_error,
            success: undefined
        }
    }
}