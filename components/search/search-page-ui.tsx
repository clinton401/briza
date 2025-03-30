"use client";
import { FC, useEffect, useState } from "react";
import { SearchInput } from "@/components/search/search-input";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { PostWithDetails, SessionType } from "@/lib/types";
import { unknown_error } from "@/lib/variables";
import { useInView } from "react-intersection-observer";
import { Loader } from "lucide-react";
import { notable } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post/post-card";
import { removeDuplicates } from "@/lib/random-utils";
import { useSearchParams, useRouter } from "next/navigation";
type FetchPostsResult = {
  data: PostWithDetails[];
  nextPage?: number;
};
export const SearchPageUI: FC<{ session: SessionType }> = ({ session }) => {
  const [inputValue, setInputValue] = useState("");
  const [confirmedSearch, setConfirmedSearch] = useState("");
  const router = useRouter();
  const [filter, setFilter] = useState<"TOP" | "LATEST" | "MEDIA">("TOP");
  const searchParams = useSearchParams();

  const fetchPosts = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }): Promise<FetchPostsResult> => {
    const response = await fetch(
      `/api/search?page=${pageParam}&filter=${filter}&query=${encodeURIComponent(confirmedSearch)}`,
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
    ["search", confirmedSearch.toLowerCase(), filter.toLowerCase()],
    {
      enabled: confirmedSearch.length > 0,
    }
  );
  const { ref, inView } = useInView();
  const query = searchParams.get("q");
  useEffect(() => {
    if (typeof query === "string" && query.trim().length > 0) {
      setConfirmedSearch(query.trim());
      setInputValue(query.trim());
    }
  }, [query]);
  
  console.log({query, inputValue, confirmedSearch})

  useEffect(() => {
    if (confirmedSearch) {
      const params = new URLSearchParams(searchParams);
      params.set("q", confirmedSearch);
      router.push(`/search?${params.toString()}`, { scroll: false });
    }
  }, [confirmedSearch, router]);

  useEffect(() => {
    if (
      !isLoading &&
      !error &&
      posts &&
      inView &&
      !isFetchingNextPage &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  }, [
    fetchNextPage,
    inView,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    error,
  ]);
  const uniquePosts = removeDuplicates(posts);
  console.log(uniquePosts);
  return (
    <div className="w-full pb-16 md:pb-8 min-h-dvh ">
      <SearchInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        setConfirmedSearch={setConfirmedSearch}
        filter={filter}
        setFilter={setFilter}
      />
      {confirmedSearch.length < 1 && (
        <section className="flex flex-col items-center justify-center py-6 min-h-[50dvh] gap-2 px-p-half text-center">
          <h1 className={`text-xl font-black ${notable.className} `}>
            Start Searching
          </h1>
          <p className=" ">
            Type something in the search bar to find what you're looking for.
          </p>
        </section>
      )}
      {confirmedSearch.length > 0 && (
        <>
          {isLoading && (
            <section className="w-full flex items-center justify-center px-p-half py-6 ">
              <Loader className=" h-6 w-6 animate-spin" />
            </section>
          )}
          {!isLoading && (error || !uniquePosts) && (
            <section className="w-full flex items-center flex-col pt-4  px-p-half gap-4">
              <h2
                className={`${notable.className} w-full text-center font-bold`}
              >
                {error?.message || unknown_error}
              </h2>
              <Button onClick={refetch}>Retry</Button>
            </section>
          )}
          {!isLoading && !error && uniquePosts && (
            <>
              {uniquePosts.length > 0 && (
                <>
                  
                      {uniquePosts.map((post: PostWithDetails) => {
                        if (!post || (filter === "MEDIA" && !post.media)) return;

                        return (
                          <PostCard
                            key={post.id}
                            session={session}
                            postDetails={post}
                            isHomePage
                            searchQuery={confirmedSearch}
                            searchFilter={filter}
                          />
                        );
                      })}
                  {isFetchingNextPage && (
                    <section className="w-full  overflow-hidden flex items-center justify-center px-p-half py-8 ">
                      <Loader className="h-4 w-4 animate-spin" />
                    </section>
                  )}
                  <section ref={ref} className=""></section>
                </>
              )}
              {uniquePosts.length < 1 && (
                <div className="flex items-center py-4 px-p-half justify-center">
                  <p className="text-sm text-center">
                    {" "}
                    No {filter === "MEDIA" ? "media" : "posts"} available
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
