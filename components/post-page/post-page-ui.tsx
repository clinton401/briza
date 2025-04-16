"use client";
import { FC, useState, useEffect } from "react";
import type { SessionType, PostWithDetails, CommentWithUserAndFollowers } from "@/lib/types";
import { PostCard } from "@/components/post/post-card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notable } from "@/lib/fonts";
import { supabase } from "@/lib/supabase";
import { hasAtLeastOneProperty } from "@/lib/random-utils";
import handleTextAreaHeight from "@/hooks/handle-text-area-height";
import { commentOnPost } from "@/actions/comment-on-post";
import createToast from "@/hooks/create-toast";
import { unknown_error } from "@/lib/variables";
import { CreateCommentUI } from "./create-comment-ui";
import { LiaComments } from "react-icons/lia";
import { Modals } from "../modals";
import useCloseOnEscKey from "@/hooks/use-close-on-esc-key";
import { CommentsLists } from "./comments-lists";
import { useQueryClient, QueryFunctionContext } from "@tanstack/react-query";
import fetchData from "@/hooks/fetch-data";
import PostLoadingPage from "@/app/status/[id]/loading";
import { ErrorComp } from "@/components/error-comp";
import { addToPostViews } from "@/actions/add-to-post-views";
type PostPageUiProps = {
  session: SessionType;
  postId: string;
};
export enum Filters {
  LIKES = "LIKES",
  LATEST = "LATEST",
  OLDEST = "OLDEST",
}
type PostMetricsRealTime = {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: string;
  new: NewMetrics | {};
  old:
    | {
        id: string;
      }
    | {};
  errors: null | string[];
};
type NewCommentMetrics = {
  id: string;
  repliesCount: number | null;
  likesCount: number | null;
};
type CommentMetricsRealTime = {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: string;
  new: NewCommentMetrics | {};
  old:
    | {
        id: string;
      }
    | {};
  errors: null | string[];
};
type NewMetrics = {
  bookmarksCount: number;
  commentsCount: number;
  id: string;
  likesCount: number;
  postId: string;
  viewsCount: number;
};

type PostQueryKey = ["post", string];

const fetchPost = async ({
  queryKey,
  signal,
}: QueryFunctionContext<PostQueryKey>): Promise<PostWithDetails> => {
  const [, postId] = queryKey;
  const response = await fetch(`/api/posts/${postId}`, { signal });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();

  return data;
};

export const PostPageUI: FC<PostPageUiProps> = ({ session, postId }) => {
  const [filter, setFilter] = useState<Filters>(Filters.LIKES);
  const {
    data: post,
    error,
    isLoading,
    refetch
  } = fetchData<PostWithDetails, PostQueryKey>(["post", postId], fetchPost, {
    enabled: !!postId,
  });
  const [isPostPending, setIsPostPending] = useState(false);
  const [content, setContent] = useState("");

  const { push, back } = useRouter();
  const { createError } = createToast();
  const queryClient = useQueryClient();
  const { textareaRef, handleInput } = handleTextAreaHeight();
  const { isOpen: isCreateCommentOpen, setIsOpen: setIsCreateCommentOpen } =
    useCloseOnEscKey();
  const handleViewsCount = async () => {
   

    try {
      const response = await addToPostViews(postId);
      const { error } = response;
      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(`Unable to add to view count: ${error}`);
    }
  };

  useEffect(() => {

      handleViewsCount();
    
  }, [postId]);
  useEffect(() => {
    const channel = supabase.channel("custom-all-channel");
    if (post) {
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "PostMetrics" },
        (payload) => {
          const data = payload as PostMetricsRealTime;
          const isOldAvailable = hasAtLeastOneProperty(data.old);
          const isNewAvailable = hasAtLeastOneProperty(data.new);
          if (data.errors) return;
          if (
            isOldAvailable &&
            isNewAvailable &&
            "id" in data.old &&
            data.old.id === post.metrics?.id
          ) {
            queryClient.setQueryData(
              ["post", post.id],
              (oldPost: undefined | PostWithDetails) => {
                if (!oldPost) return oldPost;

                const updatedMetrics = hasAtLeastOneProperty(data.new)
                  ? { ...data.new }
                  : oldPost.metrics;

                return { ...oldPost, metrics: updatedMetrics };
              }
            );
          }
        }
      );
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "CommentMetrics" },
        (payload) => {
          const data = payload as CommentMetricsRealTime;
          const isOldAvailable = hasAtLeastOneProperty(data.old);
          const isNewAvailable = hasAtLeastOneProperty(data.new);
          if (data.errors) return;

          if (
            isOldAvailable &&
            isNewAvailable &&
            "id" in data.old &&
            data.old?.id
          ) {
            const updateId = data.old.id;
            queryClient.setQueryData(
              ["comments"],
              (
                oldData: {
                  pageParams: number[];
                  pages: { data: CommentWithUserAndFollowers[] }[];
                } | null
              ) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page) => ({
                    ...page,
                    data: page.data.map((comment) => {
                      if (comment.id === updateId) {
                        const oldMetrics = comment.metrics || {
                          id: updateId,
                          likesCount: 0,
                          repliesCount: 0,
                        };

                        const newData = data.new as NewCommentMetrics;
                        const updatedMetrics = {
                          ...oldMetrics,
                          repliesCount:
                            newData?.repliesCount ?? oldMetrics.repliesCount,
                          likesCount:
                            newData?.likesCount ?? oldMetrics.likesCount,
                        };

                        return { ...comment, metrics: updatedMetrics };
                      }

                      return comment;
                    }),
                  })),
                };
              }
            );
          }
        }
      );

      channel.subscribe((status, error) => {
        if (error) {
          console.error("Subscription error:", error, status);
        }
      });
    }
    return () => {
      channel
        .unsubscribe()
        .catch((error) => console.error("Error unsubscribing:", error));
    };
  }, [post]);

  if (isLoading) {
    return <PostLoadingPage />;
  }
  if (error || !post) {
    const errorMessage = error?.message || unknown_error;
    return <ErrorComp message={errorMessage} refetch={refetch}/>;
  }
  const backHandler = () => {
    if (window.history.length > 1) {
      back();
    } else {
      push("/");
    }
  };
  const createComment = async () => {
    if (content.trim().length < 1) {
      return createError(
        "Your comment must contain at least one letter or character."
      );
    }
    try {
      setIsPostPending(true);
      const result = await commentOnPost(content, post.id, post.user.id);
      const { error, success, data } = result;
      if (error || !success || !data) return createError(unknown_error);
      await queryClient.invalidateQueries(
        {
          queryKey: ["comments", postId, filter],
          exact: true,
          refetchType: "active",
        },
        {
          throwOnError: true,
          cancelRefetch: true,
        }
      );
      setContent("");
    } catch (error) {
      console.error(`Unable to comment on post: ${error}`);
      createError(unknown_error);
    } finally {
      setIsPostPending(false);
    }
  };
  const createCommentModalHandler = () => {
    setIsCreateCommentOpen(!isCreateCommentOpen);
  };
  return (
    <div className="w-full pb-16 md:pb-8  overflow-y-auto">
      {" "}
      <section className="flex justify-between gap-x-2 gap-y-4 px-p-half border z-50 sticky flex-wrap bg-background top-0 left-0  w-full items-center py-2">
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full items-center justify-center border-none"
            onClick={backHandler}
          >
            <ArrowLeft className="" />
          </Button>
          <h2 className={`font-bold text-lg ${notable.className}`}>Post</h2>
        </div>
      </section>
      <PostCard session={session} postDetails={post} isHomePage={false} />
      <section className="w-full md:flex hidden ">
        <CreateCommentUI
          ref={textareaRef}
          createComment={createComment}
          handleInput={handleInput}
          content={content}
          setContent={setContent}
          isPostPending={isPostPending}
          session={session}
        />
      </section>
      <CommentsLists
        session={session}
        postId={post.id}
        post={post}
        commentsCount={post.metrics?.commentsCount}
        filter={filter}
        setFilter={setFilter}
      />
      <section className=" w-full  block md:hidden">
        <Modals
          closeModal={createCommentModalHandler}
          isOpen={isCreateCommentOpen}
        >
          <div className="w-full flex flex-col p-4 rounded-md gap-4 bg-background max-w-[500px]">
            <h2 className={`font-bold text  ${notable.className}`}>
              ADD COMMENT
            </h2>
            <CreateCommentUI
              ref={textareaRef}
              createComment={createComment}
              handleInput={handleInput}
              content={content}
              setContent={setContent}
              isPostPending={isPostPending}
              session={session}
            />
          </div>
        </Modals>
        <Button
          size="icon"
          className="rounded-full fixed right-p-half bottom-[15%] "
          onClick={createCommentModalHandler}
        >
          {" "}
          <LiaComments className="text-lg text-white " />
        </Button>
      </section>
    </div>
  );
};
