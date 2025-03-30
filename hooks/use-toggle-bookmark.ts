import { useMutation, useQueryClient } from "@tanstack/react-query";

const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      value,
      userId,
      searchQuery,
      searchFilter,
      sessionId
    }: {
      postId: string;
      value: boolean;
      sessionId: string;
      userId?: string;
      searchQuery?: string;
      searchFilter?: "TOP" | "LATEST" | "MEDIA"

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

      return { postId, value, userId, searchQuery, searchFilter, sessionId };
    },
    onMutate: async ({ postId, value, userId, searchQuery, searchFilter, sessionId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["posts"], exact: true }),
        queryClient.cancelQueries({ queryKey: ["bookmarks"], exact: true }),
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
          queryKey:   ["search", searchQuery?.toLowerCase(), searchFilter?.toLowerCase()],
          exact: true,
        })
      ])


      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousBookmarks = queryClient.getQueryData(["bookmarks"]);
      const previousPost = queryClient.getQueryData(["post", postId]);
      const previousUserLikedPosts = queryClient.getQueryData(["posts", userId, "likes"]);
      const previousUserBookmarkedPosts = queryClient.getQueryData(["posts", userId, "bookmarks"]);
      const previousUserTotalPosts = queryClient.getQueryData(["posts", userId, "posts"]);
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
      queryClient.setQueryData(["search", searchQuery?.toLowerCase(), searchFilter?.toLowerCase()], (old: any) => {
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
      queryClient.setQueryData(["bookmarks"], (old: any) => {
        // console.log({ old });

        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((bookmark: any) => bookmark.post?.id !== postId), // ✅ Remove bookmark
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

                    bookmarksCount: post.metrics.bookmarksCount + (value ? 1 : -1),
                  },
                  hasBookmarked: value,
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

                    bookmarksCount: post.metrics.bookmarksCount + (value ? 1 : -1),
                  },
                  hasBookmarked: value,
                }
                : post
            ),
          })),
        };
      });
      if (sessionId === userId) {
        queryClient.setQueryData(["posts", userId, "bookmarks"], (old: any) => {
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

                    bookmarksCount: post.metrics.bookmarksCount + (value ? 1 : -1),
                  },
                  hasBookmarked: value,
                }
                : post
            ),
          })),
        };
      });
      }


      return { previousPosts, previousPost, previousBookmarks, previousUserLikedPosts, previousUserBookmarkedPosts, previousUserTotalPosts, previousSearch };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousBookmarks) {
        queryClient.setQueryData(["bookmarks"], context.previousBookmarks);
      }
      if (context?.previousPost && variables?.postId) {
        queryClient.setQueryData(
          ["post", variables.postId],
          context.previousPost
        );
      }
      if (context?.previousSearch && variables?.searchQuery && variables?.searchFilter) {
        queryClient.setQueryData(
          ["search", variables.searchQuery?.toLowerCase(), variables.searchFilter?.toLowerCase()],
          context.previousSearch
        );
      }
      if (context?.previousUserLikedPosts && variables?.userId) {
        queryClient.setQueryData(
          ["posts", variables.userId, "likes"],
          context.previousUserLikedPosts
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
      if (!variables?.postId || !error) return;
      await Promise.all([queryClient.invalidateQueries(
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
          queryKey: ["bookmarks"],
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
      ]);
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

export default useToggleBookmark;
