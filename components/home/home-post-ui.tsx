"use client";
import React, { FC, useEffect, Fragment } from "react";
import { notable } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import type { SessionType, PostWithDetails } from "@/lib/types";
import { unknown_error } from "@/lib/variables";
import { PostCard } from "@/components/post/post-card";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { Loader } from "lucide-react";
import { useInView } from "react-intersection-observer";
type FetchPostsResult = {
  data: PostWithDetails[];
  nextPage?: number;
};
const fetchPosts = async ({
  pageParam = 1,
  signal,
}: {
  pageParam?: number;
  signal?: AbortSignal;
}): Promise<FetchPostsResult> => {
  const response = await fetch(`/api/posts?page=${pageParam}`, { signal });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();
  return {
    data: data.data.posts,
    nextPage: data.data.nextPage,
  };
};
export const HomePostUi: FC<{ session: SessionType }> = ({ session }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteScroll<PostWithDetails, FetchPostsResult>(
    ({ pageParam = 1, signal }) => fetchPosts({ pageParam, signal }),
    ["posts"]
  );
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage]);
  // console.log({data, page, totalPages, isLoading});
  if (isLoading)
    return (
      <div className="w-full flex items-center justify-center py-8 ">
        <Loader className=" h-6 w-6 animate-spin" />
      </div>
    );
  if (error || !data) {
    const errorMessage = error?.message || unknown_error;
    return (
      <div className="w-full flex items-center flex-col pt-4 gap-4">
        <h2
          className={`${notable.className} w-full text-center font-bold`}
        >
          {errorMessage}
        </h2>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {data.length > 0 && (
        <section className="w-full flex flex-col ">
          {data.map((post: PostWithDetails, index) => {
            if(!post) return;
            return (
              <Fragment key={index}>
                <PostCard
                  session={session}
                  postDetails={post}
                  isHomePage
                />
              </Fragment>
            );
          })}
        </section>
      )}
      {data.length < 1 && (
        <section className="flex items-center py-4 px-p-half justify-center">
          <p className="text-sm text-center">
            {" "}
            No posts available. Check back later or create the first post!
          </p>
        </section>
      )}
      {isFetchingNextPage && (
        <section className="w-full  overflow-hidden flex items-center justify-center py-8 ">
          <Loader className="h-4 w-4 animate-spin" />
        </section>
      )}
      <section ref={ref} className=""></section>
    </div>
  );
};
