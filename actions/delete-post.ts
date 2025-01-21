"use server";
import { prisma } from "@/lib/db";
import getServerUser from "@/hooks/get-server-user";
import { unauthorized_error, unknown_error } from "@/lib/variables";
import { rateLimit } from "@/lib/rate-limits";
const deletePostError = (error: string) => {
    return {error,
        success: false
    }
}
export const deletePost = async(postId: string) => {
    const session = await getServerUser();
    if (!session) return deletePostError(unauthorized_error);
    const { error } = rateLimit(session.id, true);
    if (error) return deletePostError(error);
    try{
        await prisma.post.delete({
            where: {
              id: postId,
            },
          });
          return {
            success: true,
            error: undefined
          }
    }catch(error) {
        console.error(`Unable to delete post: ${error}`);
return deletePostError(unknown_error)

    }
}