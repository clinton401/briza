import { useMutation, useQueryClient } from "@tanstack/react-query";

 const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      value,
      userId,
      postOwnerId,
      searchFilter,
      searchQuery,
      sessionId
    }: {
      postId: string;
      value: boolean;
      userId?: string;
      sessionId: string;
      postOwnerId: string;
      searchFilter?: "TOP" | "LATEST" | "MEDIA",
      searchQuery?: string;
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

      return { postId, value, userId,    searchFilter,
        searchQuery, sessionId };
    },
    onMutate: async ({ postId, value, userId,     searchFilter,
      searchQuery, sessionId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["posts"], exact: true }),
        queryClient.cancelQueries({
         queryKey: ["post", postId],
         exact: true,
       }),
        queryClient.cancelQueries({
         queryKey: ["posts", userId, "likes"],
         exact: true,
       }),
        queryClient.cancelQueries({
         queryKey: ["posts", userId, "bookmarks"],
         exact: true,
       }),
        queryClient.cancelQueries({
         queryKey: ["posts", userId, "posts"],
         exact: true,
       }),
        queryClient.cancelQueries({
         queryKey:  ["search", searchQuery?.toLowerCase(), searchFilter?.toLowerCase()],
         exact: true,
       }),
 
      ])
       
      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousUserLikedPosts = queryClient.getQueryData(["posts", userId, "likes"]);
      const previousUserBookmarkedPosts = queryClient.getQueryData(["posts", userId, "bookmarks"]);
      const previousUserTotalPosts = queryClient.getQueryData(["posts", userId, "posts"]);
      const previousPost = queryClient.getQueryData(["post", postId]);
      const previousSearch = queryClient.getQueryData( ["search", searchQuery?.toLowerCase(), searchFilter?.toLowerCase()]);
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
      queryClient.setQueryData(  ["search", searchQuery?.toLowerCase(), searchFilter?.toLowerCase()], (old: any) => {
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
      queryClient.setQueryData(["posts", userId, "bookmarks"], (old: any) => {
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
      queryClient.setQueryData(["posts", userId, "posts"], (old: any) => {
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
      // if()
      if(userId === sessionId){
      queryClient.setQueryData(["posts", userId, "likes"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((post: any) => {
              return post?.id !== postId;
            }),
          })),
        };
      });
    } else {
      queryClient.setQueryData(["posts", userId, "likes"], (old: any) => {
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
    }

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

      return { previousPosts, previousPost, previousUserLikedPosts, previousUserBookmarkedPosts, previousUserTotalPosts, previousSearch };
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
      if (context?.previousUserLikedPosts && variables?.userId) {
        queryClient.setQueryData(
          ["posts", variables.userId, "likes"],
          context.previousUserLikedPosts
        );
      }
      if (context?.previousSearch && variables?.searchQuery && variables?.searchFilter) {
        queryClient.setQueryData(
          ["search", variables.searchQuery?.toLowerCase(), variables.searchFilter?.toLowerCase()],
          context.previousSearch
        );
      }
      if (context?.previousUserBookmarkedPosts && variables?.userId) {
        queryClient.setQueryData(
          ["posts", variables.userId, "bookmarks"],
          context.previousUserBookmarkedPosts
        );
      }
      if (context?.previousUserTotalPosts && variables?.userId) {
        queryClient.setQueryData(
          ["posts", variables.userId, "posts"],
          context.previousUserTotalPosts
        );
      }
    },
    onSettled: async (data, error, variables) => {
      if (!variables?.postId || !variables?.userId) return;
await Promise.all([
  queryClient.invalidateQueries(
    {
      queryKey: ["posts"],
      exact: true,
      refetchType: "active",
    },
    {
      throwOnError: true,
      cancelRefetch: true,
    }
  ),

  
  queryClient.invalidateQueries(
    {
      queryKey: ["post", variables.postId],
      exact: true,
      refetchType: "active",
    },
    {
      throwOnError: true,
      cancelRefetch: true,
    }
  ),
])
if(variables.userId){
  await Promise.all([
    queryClient.invalidateQueries(
      {
        queryKey: ["posts", variables.userId, "likes"],
        exact: true,
        refetchType: "active",
      },
      {
        throwOnError: true,
        cancelRefetch: true,
      }
    ),
    queryClient.invalidateQueries(
      {
        queryKey: ["posts", variables.userId, "posts"],
        exact: true,
        refetchType: "active",
      },
      {
        throwOnError: true,
        cancelRefetch: true,
      }
    ),
    queryClient.invalidateQueries(
      {
        queryKey: ["posts", variables.userId, "bookmarks"],
        exact: true,
        refetchType: "active",
      },
      {
        throwOnError: true,
        cancelRefetch: true,
      }
    ),

  ])
}
       
if(variables?.searchQuery && variables?.searchFilter) {
 await queryClient.invalidateQueries(
    {
      queryKey:  ["search", variables.searchQuery.toLowerCase(), variables.searchFilter.toLowerCase()],
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

export default useToggleLike;
