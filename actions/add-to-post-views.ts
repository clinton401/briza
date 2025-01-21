"use server";
import {prisma} from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import {unknown_error, unauthorized_error} from "@/lib/variables";


export const addToPostViews = async(postId: string) => {
    const session = await getServerUser();
    if(!session) return {error: unauthorized_error, success: false};

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