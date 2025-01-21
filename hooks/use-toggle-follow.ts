import { useMutation, useQueryClient } from "@tanstack/react-query";

const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      value,
      postId,
    }: {
      userId: string;
      value: boolean;
      postId?: string;
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

      return { userId, value, postId };
    },
    onMutate: async ({ postId, userId, value }) => {
      if (postId) {
        await queryClient.cancelQueries({
          queryKey: ["post", postId],
          exact: true,
        });
      }

      const previousPost = queryClient.getQueryData(["post", postId]);
      const previousUsers = queryClient.getQueryData(["not-followed-users"]);

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

      return { previousPost, previousUsers };
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
    },
    onSettled: async (data, error, variables) => {
      if (!variables?.postId) return;

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

export default useToggleFollow;
