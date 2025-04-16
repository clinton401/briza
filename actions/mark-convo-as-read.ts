"use server";

import {prisma} from "@/lib/db";
import {unauthorized_error, unknown_error} from "@/lib/variables";
import getServerUser from "@/hooks/get-server-user";

export const markConvoAsRead = async(id: string) => {
    try{
        const session = await getServerUser();
        if(!session) return unauthorized_error;

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
        if(!conversation) return "Conversation not found or access denied";
        const userStatus = await prisma.conversationUserStatus.findFirst({
          where: {
            conversationId: id,
            userId,
          },
        });
        if(userStatus && !userStatus.isRead){
       await prisma.conversationUserStatus.updateMany({
            where: {
              conversationId: id,
              userId,
            },
            data: {
              isRead: true,
            }
          })}

          return null

    }catch(error){
        console.error(`Unable to mark conversation as read: ${error}`);
        return unknown_error
    }
}