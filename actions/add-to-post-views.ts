"use server";
import {prisma} from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import {unknown_error, unauthorized_error} from "@/lib/variables";
import { rateLimit } from "@/lib/rate-limits";
import { MAX_SUSPEND_COUNT } from "@/lib/auth-utils";


export const addToPostViews = async(postId: string) => {
    const session = await getServerUser();
  if (!session) return { error: unauthorized_error, success: false };

    if (session.suspendCount && session.suspendCount >= MAX_SUSPEND_COUNT) {
        return { error: "Your account has been blocked due to multiple violations.", success: false };
    }


  const rateLimitResult = rateLimit(session.id, true, { maxRequests: 15 });
  if (rateLimitResult.error) {
    console.warn(`Rate limit exceeded for user ${session.id}`);
    return {
      error: rateLimitResult.error,
      success: false,
    };
  }

    try{
        await prisma.$transaction(async (tx) => {
            const post = await tx.post.findUnique({
                where: {
                    id: postId
                }
            })
            if(!post) {
                throw new Error("Post not found")
            }
            await tx.postMetrics.upsert({
              where: { postId },
              create: { postId, viewsCount: 1 },
              update: { viewsCount: { increment: 1 } },
            });
      
            await tx.view.upsert({
                where: {
                  userId_postId: {
                    userId: session.id,
                    postId: postId,
                  },
                },
                create: { 
                  postId, 
                  userId: session.id 
                },
                update: {},
              });
              
              
              
          });
        return {
            error: undefined,
            success: true
        }

    }catch(error) {
        console.error(`Unable to add to post views: ${error}`);
        return {error: unknown_error, success: false}
    }

}