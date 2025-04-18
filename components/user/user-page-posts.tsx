import { FC, useEffect } from "react";
import type { SessionType, PostWithDetails } from "@/lib/types";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { unknown_error } from "@/lib/variables";
import { useInView } from "react-intersection-observer";
import { Loader } from "lucide-react";
import { notable } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post/post-card";
import { removeDuplicates } from "@/lib/random-utils";

type FetchPostsResult = {
  data: PostWithDetails[];
  nextPage?: number;
};

export const UserPagePosts: FC<{
  filter: "POSTS" | "LIKES" | "BOOKMARKS";
  userId: string;
  session: SessionType;
}> = ({ filter, userId, session }) => {
  const fetchPosts = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }): Promise<FetchPostsResult> => {
    const response = await fetch(
      `/api/users/${userId}/posts?page=${pageParam}&filter=${filter}`,
      { signal }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || unknown_error);
    }
    const data = await response.json();
    return {
      data: data.posts,
      nextPage: data.nextPage,
    };
  };

  const {
    data: posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteScroll<PostWithDetails, FetchPostsResult>(
    ({ pageParam = 1, signal }) => fetchPosts({ pageParam, signal }),
    ["posts", userId, filter.toLowerCase()]
  );
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage]);
  if (isLoading)
    return (
      <div className="w-full flex items-center justify-center py-8 ">
        <Loader className=" h-6 w-6 animate-spin" />
      </div>
    );
  if (error || !posts) {
    const errorMessage = error?.message || unknown_error;
    return (
      <div className="w-full flex items-center flex-col pt-4 gap-4">
        <h2 className={`${notable.className} w-full text-center font-bold`}>
          {errorMessage}
        </h2>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  
  const uniquePosts = removeDuplicates(posts)
  

  return (
    <section className=" w-full flex flex-col ">
      {uniquePosts.length > 0 && (
        <>
          {uniquePosts.map((post: PostWithDetails) => {
            if (!post) return;
            return (
              <PostCard
                key={post.id}
                session={session}
                postDetails={post}
                isHomePage
                userId={userId}
              />
            );
          })}
        </>
      )}
      {uniquePosts.length < 1 && (
        <div className="flex items-center py-4 px-p-half justify-center">
          <p className="text-sm text-center"> No posts available</p>
        </div>
      )}
      {isFetchingNextPage && (
        <div className="w-full  overflow-hidden flex items-center justify-center py-8 ">
          <Loader className="h-4 w-4 animate-spin" />
        </div>
      )}
      <section ref={ref} className=""></section>
    </section>
  );
};
