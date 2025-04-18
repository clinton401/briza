"use client"
import {FC, useEffect, Fragment} from "react"
import {
    SessionType,
    BookmarksType
  } from "@/lib/types";
  import { unknown_error } from "@/lib/variables";
  import useInfiniteScroll from "@/hooks/use-infinite-scroll";
  import { Loader, BookmarkPlus } from "lucide-react";
  import { useInView } from "react-intersection-observer";
  import { Button } from "@/components/ui/button";
  import { notable } from "@/lib/fonts";
  
import { PostCard } from "@/components/post/post-card";
  type FetchBookmarksResult = {
    data: BookmarksType[];
    nextPage?: number;
  };
const fetchBookmarks = async ({
  pageParam = 1,
  signal,
}: {
  pageParam?: number;
  signal?: AbortSignal;
}): Promise<FetchBookmarksResult> => {
  const response = await fetch(`/api/bookmarks?page=${pageParam}`, {
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();
  return {
    data: data.bookmarks,
    nextPage: data.nextPage,
  };
};
  export const BookmarkPageUI: FC<{session: SessionType}> = ({session}) => {
    
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
      } = useInfiniteScroll<BookmarksType, FetchBookmarksResult>(
        ({ pageParam = 1, signal }) => fetchBookmarks({ pageParam, signal }),
        ["bookmarks"]
      )
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
      if (error || !data) {
        const errorMessage = error?.message || unknown_error;
        return (
          <div className="w-full flex items-center flex-col pt-4 gap-4">
            <h2
              className={`${notable.className} w-full text-center font-black text-lg`}
            >
              {errorMessage}
            </h2>
            <Button onClick={refetch}>Retry</Button>
          </div>
        );
      }
      return (
        <div className="w-full pb-16 md:pb-8  ">
          {data.length < 1 && (
            <section className="flex flex-col items-center justify-center px-p-half py-12">
              <div className="rounded-full bg-secondary  p-4 mb-4">
                <BookmarkPlus className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                No bookmarks
              </h2>
              <p className="text-gray-5 text-center max-w-sm">
                When you have bookmarks, they&apos;ll show up here. Stay tuned for
                updates!
              </p>
            </section>
          )}

          {data.length > 0 && (
            <section className="flex flex-col ">
              {data.map((bookmark: BookmarksType) => {
               if(!bookmark) return;
               return (
                 <Fragment key={bookmark.id}>
                   <PostCard
                     session={session}
                     postDetails={bookmark.post}
                     isHomePage={true}
                   />
                 </Fragment>
               )
              })}
            </section>
          )}
          {isFetchingNextPage && (
            <section className="w-full px-p-half overflow-hidden flex items-center justify-center py-8 ">
              <Loader className="h-4 w-4 animate-spin" />
            </section>
          )}
          <section ref={ref} className="w-full"></section>
        </div>
      );
  }