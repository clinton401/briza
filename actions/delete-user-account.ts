"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { unauthorized_error } from "@/lib/variables";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";

export const deleteUserAccount = async () => {
  
    try {
        const session = await getServerUser();

        if (!session) {
            return { success: false, message: unauthorized_error };
        }
        if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
            return { success: false, message: "Your account has been blocked due to multiple violations." };
        }
        const userId = session.id;
        await prisma.user.delete({
            where: { id: userId },
        });

        return { success: true, message: "User account deleted." };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, message: "Failed to delete user." };
    }
};
