import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserResponse } from "@/lib/types";

const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      value,
      postId,
      followId,
      filter,
      searchQuery
    }: {
      userId: string;
      value: boolean;
      postId?: string;
      followId?: string;
      searchQuery?: string;
      filter?: "FOLLOWERS" | "FOLLOWING"
    }) => {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: value ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle follow");
      }

      return { userId, value, postId, followId, filter, searchQuery };
    },
    onMutate: async ({ postId, userId, value, followId, filter, searchQuery }) => {
      await queryClient.cancelQueries({
        queryKey: ["not-followed-users"],
        exact: true,
      });
      if (postId) {
        await queryClient.cancelQueries({
          queryKey: ["post", postId],
          exact: true,
        });
      }


      if (searchQuery) {
        await queryClient.cancelQueries({
          queryKey: ["search", searchQuery.toLowerCase(), "people"],
          exact: true,
        });
      }



      const previousPost = queryClient.getQueryData(["post", postId]);
      const previousUsers = queryClient.getQueryData(["not-followed-users"]);
      const previousFollowers = queryClient.getQueryData(["follow", followId, "followers"]);
      const previousFollowing = queryClient.getQueryData(["follow", followId, "following"]);
      const previousUser = queryClient.getQueryData(["user", userId]);
      const previousSearch = queryClient.getQueryData(["search", searchQuery?.toLowerCase(), "people"]);

      queryClient.setQueryData(["post", postId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          isFollowing: value,
        };
      });
      queryClient.setQueryData(["not-followed-users"], (old: any) => {
        if (!old) return old;
        const newData = old.map((data: any) => {
          return data.id === userId ? { ...data, hasFollowed: value } : data;
        });
        return newData;
      });

      // queryClient.setQueryData(["follow", followId, "following"], (old: any) => {

      //   if (!old) return old;

      //   return {
      //     ...old,
      //     pages: old.pages.map((page: any) =>({
      //       ...page,

      //      data: page.data.map((data: any) =>
      //         data.id === userId ? { ...data, hasFollowed: value } : data
      //       )})
      //     ),
      //   };
      // })
      queryClient.setQueryData(["user", userId], (old: UserResponse | null) => {
        if (!old) return old;

        return {
          ...old,
          isFollowing: value,
          metrics: old.metrics
            ? {
              ...old.metrics,
              followersCount: value
                ? old.metrics.followersCount + 1
                : Math.max(0, old.metrics.followersCount - 1),
            }
            : null,
        };
      });
      if (searchQuery) {
        queryClient.setQueryData(["search", searchQuery?.toLowerCase(), "people"], (old: any) => {

          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((data: any) =>
                data?.id === userId ? { ...data, hasFollowed: value } : data
              )
            })
            ),
          };
        });
      }

      if (followId) {



        queryClient.setQueryData(["follow", followId, "following"], (old: any) => {

          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((data: any) =>
                data?.id === userId ? { ...data, hasFollowed: value } : data
              )
            })
            ),
          };
        });

        queryClient.setQueryData(["follow", followId, "followers"], (old: any) => {

          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((data: any) =>
                data?.id === userId ? { ...data, hasFollowed: value } : data
              )
            })
            ),
          };
        })
      }




      return { previousPost, previousUsers, previousFollowers, previousFollowing, previousUser, previousSearch };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["not-followed-users"], context.previousUsers);
      }
      if (context?.previousPost && variables?.postId) {
        queryClient.setQueryData(
          ["post", variables.postId],
          context.previousPost
        );
      }
      if (context?.previousUser && variables?.userId) {
        queryClient.setQueryData(
          ["user", variables.userId],
          context.previousPost
        );
      }
      if (context?.previousSearch && variables?.searchQuery) {
        queryClient.setQueryData(
          ["search", variables.searchQuery?.toLowerCase(), "people"],
          context.previousSearch
        );
      }
      if (context?.previousFollowers && variables?.followId) {
        queryClient.setQueryData(
          ["follow", variables.followId, "followers"],
          context.previousFollowers
        );
      }
      if (context?.previousFollowing && variables?.followId) {
        queryClient.setQueryData(
          ["follow", variables.followId, "following"],
          context.previousFollowing
        );
      }
    },
    onSettled: async (data, error, variables) => {
      if (variables?.userId) {
        await queryClient.invalidateQueries(
          {
            queryKey: ["user", variables.followId],
            exact: true,
            refetchType: "active",
          },
          {
            throwOnError: true,
            cancelRefetch: true,
          }
        )
      }
      if (variables?.followId) {
        await Promise.all([

          queryClient.invalidateQueries(
            {
              queryKey: ["follow", variables.followId, "followers"],
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
              queryKey: ["follow", variables.followId, "following"],
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
      if (variables?.postId) {

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
      }
      if (variables?.searchQuery) {

        await queryClient.invalidateQueries(
          {
            queryKey: ["search", variables.searchQuery?.toLowerCase(), "people"],
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

export default useToggleFollow;
