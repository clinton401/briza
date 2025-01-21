import { FC, Dispatch, SetStateAction, useEffect } from "react";
import { Filters } from "@/components/post-page/post-page-ui";
import { unknown_error } from "@/lib/variables";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import {
  CommentWithUserAndFollowers,
  PostWithDetails,
  SessionType,
} from "@/lib/types";
import { notable } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Loader, SlidersHorizontal } from "lucide-react";
import { CommentCard } from "./comment-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInView } from "react-intersection-observer";
type FetchCommentsResult = {
  data: CommentWithUserAndFollowers[];
  nextPage?: number;
};

const fetchComments = async ({
  pageParam = 1,
  postId,
  filter,
  signal,
}: {
  pageParam?: number;
  postId: string;
  filter: Filters;
  signal?: AbortSignal;
}): Promise<FetchCommentsResult> => {
  const response = await fetch(
    `/api/comments?postId=${postId}&page=${pageParam}&filter=${filter}`,
    { signal }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();
  return {
    data: data.data.comments,
    nextPage: data.data.nextPage,
  };
};

type CommentListProps = {
  postId: string;
  session: SessionType;
  post: PostWithDetails;
  commentsCount: number | null | undefined;
  filter: Filters;
  setFilter: Dispatch<SetStateAction<Filters>>

};

export const CommentsLists: FC<CommentListProps> = ({
  postId,
  session,
  post,
  commentsCount,
  filter,
  setFilter
}) => {

  const {
    data: comments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteScroll<CommentWithUserAndFollowers, FetchCommentsResult>(
    ({ pageParam = 1, signal }) =>
      fetchComments({ pageParam, postId, filter, signal }),
    ["comments", postId, filter]
  );
  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage]);
  const isValid = typeof commentsCount === "number" && commentsCount < 1;

  if (isValid) {
    return (
      <section className="flex items-center py-4 px-p-half justify-center">
        <p className="text-sm text-center">
          Be the first to share your thoughts!
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="w-full  overflow-hidden flex items-center justify-center py-8 ">
        <Loader className="h-4 w-4 animate-spin" />
      </section>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <section className="w-full flex items-center flex-col pt-4 gap-4">
        <h2
          className={`${notable.className} w-full text-center font-black text-sm`}
        >
          {error?.message || unknown_error}
        </h2>
        <Button onClick={refetch}>Retry</Button>
      </section>
    );
  }

  if (comments.length < 1) {
    return (
      <section className="flex items-center py-4 px-p-half justify-center">
        <p className="text-sm text-center">
          Be the first to share your thoughts!
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="w-full border-x-transparent border py-4 flex gap-x-2 gap-y-4 justify-between  items-center  px-p-half ">
        <h2 className={`font-bold ${notable.className}`}>COMMENTS</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="border-none">
              <SlidersHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuLabel>Sort comments by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={filter}
              onValueChange={(value) => {
                setFilter(value as Filters);
                refetch(); // Refetch with new filter
              }}
            >
              <DropdownMenuRadioItem value={Filters.LIKES}>
                Likes
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={Filters.LATEST}>
                Latest
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={Filters.OLDEST}>
                Oldest
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section className="w-full flex flex-col">
        {comments.map((comment, index) => {
          return (
            <CommentCard
              key={index}
              filter={filter}
              post={post}
              comment={comment}
              session={session}
            />
          );
        })}
      </section>
      {isFetchingNextPage && (
        <section className="w-full  overflow-hidden flex items-center justify-center py-8 ">
          <Loader className="h-4 w-4 animate-spin" />
        </section>
      )}

      <section ref={ref} className=""></section>
    </>
  );
};
