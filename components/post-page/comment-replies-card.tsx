import {FC, useState} from "react";
import { type CommentWithUserAndFollowers } from "@/lib/types";
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

import { User2, Check } from "lucide-react";
import Link from "next/link";
import { CiHeart } from "react-icons/ci";
import { IoMdHeart } from "react-icons/io";
import { formatNumber } from "@/lib/random-utils";
import useToggleCommentLike from "@/hooks/use-toggle-comment-like";
import { Filters } from "./post-page-ui";
type CommentReplyCardProps = {
    commentReply: CommentWithUserAndFollowers;
    postId: string;
    filter: Filters;
    
  };
export const CommentRepliesCard: FC<CommentReplyCardProps> = ({commentReply, postId, filter}) => {

    const { push } = useRouter();
const {mutate: toggleLike} = useToggleCommentLike();
    const {parentCommentId, content, createdAt, user, metrics } = commentReply;
    const reply_owner_profile_pic = user?.profilePictureUrl;
    const reply_owner_username = user?.username;
    const reply_owner_bio = user?.bio;
    const reply_owner_name = user.name;
    const reply_owner_id = user.id;
    const reply_owner_account_created_at = user.createdAt;
    const is_reply_owner_blue_verified = user.blueCheckVerified;
    if (
        !parentCommentId || 
      !reply_owner_profile_pic ||
      !reply_owner_username ||
      !reply_owner_bio ||
      !metrics ||
      metrics.likesCount === null
    )
      return null;
  
    const uppercase_name = getUppercaseFirstLetter(reply_owner_name);
    const uppercase_username = getUppercaseFirstLetter(reply_owner_username);
    const joined_date = new Date(reply_owner_account_created_at);
    const { year: joined_year, monthText } = dateHandler(joined_date);
    const replyCreatedDate = new Date(createdAt);
    const { amount, type } = timeAgoNumber(replyCreatedDate);
    const { monthText: replyMonthText, dayOfMonth: replyDay } =
      dateHandler(createdAt);
  
    const likeOrUnlike = async () => {
      toggleLike(
        {
          postId: postId,
          value: !commentReply.hasLiked,
          commentId: commentReply.id,
          commentOwnerId: commentReply.user.id,
          filter,
          replyParentId: commentReply.parentCommentId
        },
        {
          onError: (error) => {
            console.error("Error toggling like:", error);
          },
        }
      );
    };
    return (
        <Card
        className={`w-full relative py-1 px-p-half   `}
      >
        <span className="absolute w-[41px] h-4 bottom-full  border-x-transparent border-t-transparent border right-full"></span>
        <CardHeader className=" py-1 px-0">
          <div className="flex w-full gap-2 items-center  justify-between">
            <div className="grow flex  h-11 items-center overflow-hidden gap-2">
              <HoverCardUI
                blueCheckVerified={is_reply_owner_blue_verified}
                profilePictureUrl={reply_owner_profile_pic}
                username={reply_owner_username}
                bio={reply_owner_bio}
                joined_month={monthText}
                joined_year={joined_year}
              >
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => push(`/user/${reply_owner_id}`)}
                >
                  {/* <Link href={`/user/${id}`} > */}
  
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={reply_owner_profile_pic}
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
                    href={`/user/${reply_owner_id}`}
                    className="  w-auto hover:underline   flex items-center"
                  >
                    {uppercase_name}
  
                    {is_reply_owner_blue_verified && (
                      <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                        <Check className="h-2 w-2" />
                      </span>
                    )}
                  </Link>
                </span>
                {/* <span className=" flex truncate items-center">
                  <Link
                    href={`/user/${reply_owner_username}`}
                    className="  w-auto hover:underline  text-muted-foreground"
                  >
                    @{reply_owner_username}
                  </Link>
                </span> */}
              </span>
            </div>
  
            {type !== "wk" ? (
              <h6 className="text-xs">
                {amount}
                {type}
              </h6>
            ) : (
              <h6 className="text-xs flex items-center gap-1">
                <span> {replyMonthText.slice(0, 3)}</span>
                <span>{replyDay}</span>
              </h6>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col w-full p-0 gap-y-4">
          <p className="w-full text-sm">{content}</p>
        </CardContent>
        <CardFooter className="w-full px-0 py-1  items-center  flex  gap-4">

            {" "}
            <Button
              onClick={likeOrUnlike}
              size="icon"
              variant="outline"
              className="flex items-center   bg-transparent border-none text-xs justify-center gap-1  borde cursor-pointer rounded-full"
            >
              {commentReply.hasLiked ? (
                <IoMdHeart className="text-destructive text-base" />
              ) : (
                <CiHeart className=" text-base" />
              )}
              <p>{formatNumber(metrics.likesCount)}</p>
            </Button>
 
  
         
        </CardFooter>
      </Card>
    )
}