import { useMutation, useQueryClient } from "@tanstack/react-query";

 const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      value,
    }: {
      postId: string;
      value: boolean;
    }) => {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: value ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, value }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle bookmark");
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
                      bookmarksCount:
                        (post.metrics?.bookmarksCount || 0) + (value ? 1 : -1),
                    },
                    hasBookmarked: value,
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
            bookmarksCount:
              (old.metrics?.bookmarksCount || 0) + (value ? 1 : -1),
          },
          hasBookmarked: value,
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

export default useToggleBookmark;
