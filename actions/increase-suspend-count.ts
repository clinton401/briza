"use server";
import {prisma} from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { unknown_error, unauthorized_error } from "@/lib/variables";
import { findUnique } from "@/data/users";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";


export const increaseSuspendCount = async() => {
    try{
        const session = await getServerUser();
        if (!session) return { error: unauthorized_error, success: false };
        if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
            return { error: "Your account has been blocked due to multiple violations.", success: false };
        }

        const user = await findUnique(session.email);
        if(!user) return {error: "User not found", success: false};
        if(user.suspendCount >= MAX_SUSPEND_COUNT) {
            return {error: "Maximum suspend count reached", success: false};
        }
        const isSuspended = user.suspendCount + 1 >= MAX_SUSPEND_COUNT;
        const suspendReason = isSuspended ? "Suspend triggered due to unsafe media upload (nudity, violence, or prohibited content)." : null;
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                suspendCount: {
                    increment: 1
                },
                isSuspended,
                suspendReason
            }
        });

        return {
            error: undefined,
            success: true
        };
        
    } catch (error) {
        console.error(`Unable to increase suspend count: ${error}`);
        return {error: unknown_error, success: false};
    }
}