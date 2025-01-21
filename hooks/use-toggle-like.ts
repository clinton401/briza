import { useMutation, useQueryClient } from "@tanstack/react-query";

 const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      value,
      postOwnerId,
    }: {
      postId: string;
      value: boolean;
      postOwnerId: string;
    }) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: value ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, value, postOwnerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle like");
      }

      return { postId, value };
    },
    onMutate: async ({ postId, value }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"], exact: true });
      await queryClient.cancelQueries({
        queryKey: ["post", postId],
        exact: true,
      });

      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousPost = queryClient.getQueryData(["post", postId]);


      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: any) =>
              post?.id === postId
                ? {
                    ...post,
                    metrics: {
                      ...post.metrics,
                      
                      likesCount: post.metrics.likesCount + (value ? 1 : -1),
                    },
                    hasLiked: value,
                  }
                : post
            ),
          })),
        };
      });

      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          metrics: {
            ...old.metrics,
            likesCount: old.metrics.likesCount + (value ? 1 : -1),
          },
          isLiked: value,
        };
      });

      return { previousPosts, previousPost };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousPost && variables?.postId) {
        queryClient.setQueryData(
          ["post", variables.postId],
          context.previousPost
        );
      }
    },
    onSettled: async (data, error, variables) => {
      if (!variables?.postId) return;

      await queryClient.invalidateQueries(
        {
          queryKey: ["posts"],
          exact: true,
          refetchType: "active",
        },
        {
          throwOnError: true,
          cancelRefetch: true,
        }
      );

      await queryClient.invalidateQueries(
        {
          queryKey: ["post", variables.postId],
          exact: true,
          refetchType: "active",
        },
        {
          throwOnError: true,
          cancelRefetch: true,
        }
      );
    },
  });
};

export default useToggleLike;
