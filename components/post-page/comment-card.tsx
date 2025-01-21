import { FC, useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  type CommentWithUserAndFollowers,
  SessionType,
  PostWithDetails,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  dateHandler,
  getUppercaseFirstLetter,
  timeAgoNumber,
} from "@/lib/random-utils";
import { HoverCardUI } from "@/components/hover-card-ui";

import { User2, Check, Loader } from "lucide-react";
import Link from "next/link";
import { CiHeart } from "react-icons/ci";
import { IoMdHeart } from "react-icons/io";
import { formatNumber } from "@/lib/random-utils";
import { CommentRepliesCard } from "@/components/post-page/comment-replies-card";
import { Modals } from "../modals";
import useCloseOnEscKey from "@/hooks/use-close-on-esc-key";
import handleTextAreaHeight from "@/hooks/handle-text-area-height";
import { notable } from "@/lib/fonts";
import { CreateCommentUI } from "./create-comment-ui";
import createToast from "@/hooks/create-toast";
import { unknown_error } from "@/lib/variables";
import { replyToComment } from "@/actions/reply-to-comment";
import fetchData from "@/hooks/fetch-data";
import { useQueryClient, QueryFunctionContext } from "@tanstack/react-query";
import useToggleCommentLike from "@/hooks/use-toggle-comment-like";
import { Filters } from "./post-page-ui";
type CommentCardProps = {
  comment: CommentWithUserAndFollowers;
  session: SessionType;
  post: PostWithDetails;
  filter: Filters
};
type ReplyQueryKey = ["comment-replies", string];

export const CommentCard: FC<CommentCardProps> = ({
  comment,
  session,
  post,
  filter
}) => {
  const [isRepliesLoading, setIsRepliesLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReply, setShowReply] = useState(false);

const parentCommentId = comment.id;
const fetchReplies = async ({
  queryKey,
  signal,
}: QueryFunctionContext<ReplyQueryKey>): Promise<
  CommentWithUserAndFollowers[]
> => {
 
  const response = await fetch(`/api/comments/${post.id}/replies?parent=${parentCommentId}`, { signal });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();
  return data.replies;
};
  const {
    isLoading,
    error,
    data: commentReplies,
    refetch,
  } = fetchData<CommentWithUserAndFollowers[], ReplyQueryKey>(
    ["comment-replies", comment.id],
    fetchReplies,
    { enabled: false }
  );

  const { textareaRef, handleInput } = handleTextAreaHeight();
  const { isOpen, setIsOpen } = useCloseOnEscKey();
const {mutate: toggleLike} = useToggleCommentLike();
  const { push } = useRouter();
  const { content, createdAt, user, metrics } = comment;
  const comment_owner_profile_pic = user?.profilePictureUrl;
  const comment_owner_username = user?.username;
  const comment_owner_bio = user?.bio;
  const comment_owner_name = user.name;
  const comment_owner_id = user.id;
  const comment_owner_account_created_at = user.createdAt;
  const is_comment_owner_blue_verified = user.blueCheckVerified;
  if (
    !comment_owner_profile_pic ||
    !comment_owner_username ||
    !comment_owner_bio ||
    !metrics ||
    metrics.likesCount === null ||
    metrics.repliesCount === null
  )
    return null;

  const queryClient = useQueryClient();
  const uppercase_name = getUppercaseFirstLetter(comment_owner_name);
  const uppercase_username = getUppercaseFirstLetter(comment_owner_username);
  const joined_date = new Date(comment_owner_account_created_at);
  const { year: joined_year, monthText } = dateHandler(joined_date);
  const commentCreatedDate = new Date(createdAt);
  const { amount, type } = timeAgoNumber(commentCreatedDate);
  const { monthText: commentMonthText, dayOfMonth: commentDay } =
    dateHandler(createdAt);

  const { createSimple, createError } = createToast();

  const likeOrUnlike = async () => {
    toggleLike(
      {
        postId: post.id,
        value: !comment.hasLiked,
        commentId: comment.id,
        commentOwnerId: comment_owner_id,
        filter
      },
      {
        onError: (error) => {
          console.error("Error toggling like:", error);
        },
      }
    );
  };
  const viewReply = async () => {
    const isShown = showReply;
    setShowReply(!showReply);
    // if (
    //   !isShown &&
    //   commentReplies &&
    //   metrics &&
    //   metrics.repliesCount &&
    //   metrics.repliesCount > 0 &&
    //   commentReplies.length <= metrics.repliesCount &&
    //   metrics.repliesCount > 0
    // ) {
      refetch();
    // }
  };
  const replyModalHandler = () => {
    setIsOpen(!isOpen);
  };
  const createReply = async () => {
    if (content.trim().length < 1) {
      return createError(
        "Your comment must contain at least one letter or character."
      );
    }
    try {
      setIsRepliesLoading(true);
      const result = await replyToComment(
        replyContent,
        post.id,
        comment_owner_id,
        comment.id
      );
      const { error, success, data } = result;
      if (error || !success || !data)
        return createError(error || unknown_error);
      queryClient.setQueryData(["comment-replies", comment.id], (old: any) => {
        if (!old) return old;
        const newData = [data, ...old];
        return newData;
      });

      await queryClient.invalidateQueries(
        {
          queryKey: ["comment-replies", comment.id],
          exact: true,
          refetchType: "active",
        },
        {
          throwOnError: true,
          cancelRefetch: true,
        }
      );
      await queryClient.invalidateQueries(
        {
          queryKey: ["comments", post.id, filter],
          exact: true,
          refetchType: "active",
        },
        {
          throwOnError: true,
          cancelRefetch: true,
        }
      );
      setReplyContent("");
      setShowReply(true);
      replyModalHandler();
    } catch (error) {
      console.error(`Unable to reply to comment: ${error}`);
      createError(unknown_error);
    } finally {
      setIsRepliesLoading(false);
    }
  };
  // console.log(commentReplies)
  return (
    <Card
      className={`w-full border-x-transparent rounded-none py-1 px-p-half   `}
    >
      <CardHeader className=" py-2 px-0">
        <div className="flex w-full gap-2 items-center  justify-between">
          <div className="grow flex  h-11 items-center overflow-hidden gap-2">
            <HoverCardUI
              blueCheckVerified={is_comment_owner_blue_verified}
              profilePictureUrl={comment_owner_profile_pic}
              username={comment_owner_username}
              bio={comment_owner_bio}
              joined_month={monthText}
              joined_year={joined_year}
            >
              <Button
                variant="link"
                className="p-0"
                onClick={() => push(`/user/${comment_owner_username}`)}
              >
                {/* <Link href={`/user/${id}`} > */}

                <Avatar>
                  <AvatarImage
                    src={comment_owner_profile_pic}
                    alt={`${uppercase_username} profile picture`}
                  />
                  <AvatarFallback>
                    <User2 />
                  </AvatarFallback>
                </Avatar>
                {/* </Link> */}
              </Button>
            </HoverCardUI>

            <span className=" h-full w-3/4 truncate overflow-hidden  justify-center flex flex-col gap-1 text-xs">
              <span className=" flex truncate items-center">
                <Link
                  href={`/user/${comment_owner_username}`}
                  className="  w-auto hover:underline   flex items-center"
                >
                  {uppercase_name}

                  {is_comment_owner_blue_verified && (
                    <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                      <Check className="h-2 w-2" />
                    </span>
                  )}
                </Link>
              </span>
              <span className=" flex truncate items-center">
                <Link
                  href={`/user/${comment_owner_username}`}
                  className="  w-auto hover:underline  text-muted-foreground"
                >
                  @{comment_owner_username}
                </Link>
              </span>
            </span>
          </div>

          {type !== "wk" ? (
            <h6 className="text-xs">
              {amount}
              {type}
            </h6>
          ) : (
            <h6 className="text-xs flex items-center gap-1">
              <span> {commentMonthText.slice(0, 3)}</span>
              <span>{commentDay}</span>
            </h6>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col w-full p-0 gap-y-4">
        <p className="w-full ">{content}</p>
        <Modals closeModal={replyModalHandler} isOpen={isOpen}>
          <div className="w-full flex flex-col p-4 rounded-md gap-4 bg-background max-w-[500px]">
            <div className={`flex items-center gap-1 `}>
              <span className={`text-sm font-normal ${notable.className} `}>
                Reply to
              </span>
              <HoverCardUI
                blueCheckVerified={is_comment_owner_blue_verified}
                profilePictureUrl={comment_owner_profile_pic}
                username={comment_owner_username}
                bio={comment_owner_bio}
                joined_month={monthText}
                joined_year={joined_year}
              >
                <Link
                  href={`/user/${comment_owner_username}`}
                  className="text-xs hover:underline "
                >
                  @{comment_owner_username}
                </Link>
              </HoverCardUI>
            </div>
            <CreateCommentUI
              ref={textareaRef}
              createComment={createReply}
              handleInput={handleInput}
              content={replyContent}
              setContent={setReplyContent}
              isPostPending={isRepliesLoading}
              session={session}
            />
          </div>
        </Modals>
      </CardContent>
      <CardFooter className="w-full px-0 py-2  flex-col  flex  gap-2">
        <div className="flex  w-full items-center gap-4">
          {" "}
          <Button
            onClick={likeOrUnlike}
            size="icon"
            variant="outline"
            className="flex items-center   bg-transparent border-none text-xs justify-center gap-1  borde cursor-pointer rounded-full"
          >
            {comment.hasLiked ? (
              <IoMdHeart className="text-destructive text-base" />
            ) : (
              <CiHeart className=" text-base" />
            )}
            <p>{formatNumber(metrics.likesCount)}</p>
          </Button>
          <Button
            variant="outline"
            className="rounded-full text-xs p-2 h-auto"
            onClick={replyModalHandler}
          >
            Reply
          </Button>
        </div>

        {metrics.repliesCount > 0 && isLoading && (
          <div className="w-full flex items-center justify-center">
            <Loader className="animate-spin h-4 w-4 " />
          </div>
        )}
        {metrics.repliesCount > 0 && showReply && !isLoading && (
          <>
            {!error && commentReplies && commentReplies.length > 0 ? (
              <div className="w-full relative flex pl-10 ">
                <span className="w-[1px] absolute top-0 left-0 h-full bg-secondary rounded-full"></span>
                <div className="flex flex-col gap-4 grow">
                  {commentReplies.map((reply) => {
                    return (
                      <CommentRepliesCard commentReply={reply} key={reply.id} filter={filter} postId={post.id}/>
                    );
                  })}
                </div>
              </div>
            ) : <div className="w-full flex items-center flex-col pt-4 px-p-half gap-4">
            <h2
              className={`${notable.className} w-full text-center text-sm font-black `}
            >
              {error?.message || unknown_error}
            </h2>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                refetch()
              }
            >
              Retry
            </Button>
          </div>}
          
          </>
        )}
        {metrics.repliesCount > 0 && !error && !isLoading && (
          <div className="flex items-center justify-center w-full">
            <Button
              className="text-sm bg-transparent p-0  text-center hover:bg-transparent text-foreground"
              onClick={viewReply}
            >
              {showReply ? "Hide" : "View"} replies
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
