import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Filters } from "@/components/post-page/post-page-ui";
import { type CommentWithUserAndFollowers } from "@/lib/types";
const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      value,
      commentId,
      commentOwnerId,
      filter,
      replyParentId
    }: {
      postId: string;
      value: boolean;
      commentOwnerId: string;
      commentId: string;
      replyParentId?: string | null;
      filter: Filters;
    }) => {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: value ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, value, commentOwnerId, commentId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle like");
      }

      return { postId, value, commentId, filter, replyParentId };
    },
    onMutate: async ({ postId, value, commentId, filter, replyParentId }) => {

      await queryClient.cancelQueries({ queryKey: ["comments", postId, filter], exact: true });
      await queryClient.cancelQueries({ queryKey: ["comment-replies", replyParentId], exact: true });

      const previousComments = queryClient.getQueryData(["comments", postId, filter]);
      const previousCommentReplies = queryClient.getQueryData(["comment-replies", replyParentId]);


      queryClient.setQueryData(["comments", postId, filter], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((comment: any) =>
              comment?.id === commentId ? {
                ...comment,
                metrics: {
                  ...comment.metrics,

                  likesCount: comment.metrics.likesCount + (value ? 1 : -1),
                },

                hasLiked: value,
              } : comment
            )
          }))
        }
      })
      queryClient.setQueryData(["comment-replies", replyParentId], (old: any) => {
        if (!old) return old;
        return old.map((reply: any) => {
          return reply.id === commentId ? {
            ...reply, 
            metrics: {
              ...reply.metrics,

              likesCount: reply.metrics.likesCount + (value ? 1 : -1),
            },
            hasLiked: value
          } : reply
        });

      })




      return { previousComments, previousCommentReplies };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments && variables?.postId && variables?.filter) {
        queryClient.setQueryData(["comments", variables.postId, variables.filter], context.previousComments);
      }
      if (context?.previousCommentReplies && variables.replyParentId) {
        queryClient.setQueryData(["comment-replies", variables.replyParentId], context.previousCommentReplies)
      }

    },
    onSettled: async (data, error, variables) => {
      if (variables?.postId && variables?.filter) {
        await queryClient.invalidateQueries(
          {
            queryKey: ["comments", variables.postId, variables.filter],
            exact: true,
            refetchType: "active",
          },
          {
            throwOnError: true,
            cancelRefetch: true,
          }
        );
      }

      if (variables?.replyParentId) {
        await queryClient.invalidateQueries(
          {
            queryKey: ["comment-replies", variables.replyParentId],
            exact: true,
            refetchType: "active",
          },
          {
            throwOnError: true,
            cancelRefetch: true,
          }
        );
      }


    },
  });
};

export default useToggleCommentLike;
