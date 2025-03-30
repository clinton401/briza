import { FC } from "react";
import {Button} from "@/components/ui/button";
import type {  PostWithDetails } from "@/lib/types";
import { CiHeart, CiBookmark } from "react-icons/ci";
import { IoMdHeart, IoIosBookmark } from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import { LiaComments } from "react-icons/lia";
import { formatNumber } from "@/lib/random-utils";
import {PostMetricsTypes} from "@/lib/types";
import {unknown_error} from "@/lib/variables";
import createToast from "@/hooks/create-toast";
import {bookmarkOrUnbookmarkPost} from "@/actions/bookmark-or-unbookmark-post";
import useToggleLike from "@/hooks/use-toggle-like"
import useToggleBookmark from "@/hooks/use-toggle-bookmark"
type PostMetricsProps = {
  hasLiked: boolean;
  hasBookmarked: boolean;
  metrics: PostMetricsTypes
  postDetails: PostWithDetails;
  userId?: string;
  sessionId: string;
  searchQuery?: string;
   searchFilter?: "TOP" | "LATEST" | "MEDIA",
};
export const PostMetrics: FC<PostMetricsProps> = ({
  metrics,
  hasLiked,
  hasBookmarked,
  postDetails,
  userId,
  searchFilter,
  searchQuery,
  sessionId
}) => {
  const { likesCount, commentsCount, bookmarksCount, viewsCount } = metrics;

  const { mutate: toggleLike } = useToggleLike();
  const { mutate: toggleBookmark} = useToggleBookmark();
  const bookmarkOrUnbookmark = async () => {
    toggleBookmark(
      {
        postId: postDetails.id,
        value: !postDetails.hasBookmarked,
        searchFilter,
        searchQuery,
        userId,
        sessionId
      },
      {
        onError: (error) => {
          console.error("Error toggling bookmark:", error);
        },
      }
    );
  };
  const likeOrUnlike = async () => {
    toggleLike(
      {
        postId: postDetails.id,
        value: !postDetails.hasLiked,
        searchFilter,
        searchQuery,
        postOwnerId: postDetails.user.id, 
        userId,
        sessionId
      },
      {
        onError: (error) => {
          console.error("Error toggling like:", error);
        },
      }
    );
    
  };
  return (
    <div className="flex items-center justify-between text-muted-foreground *:text-xs " onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
      <Button size="icon" variant="outline" className="flex items-center   bg-transparent border-none text-xs justify-center gap-1  borde cursor-pointer rounded-full">
        <IoEyeOutline className=" text-base " />
        <p>{formatNumber(viewsCount)}</p>
      </Button>
      <Button  onClick={likeOrUnlike}  size="icon" variant="outline" className="flex items-center   bg-transparent border-none text-xs justify-center gap-1  borde cursor-pointer rounded-full">
        {hasLiked ? (
          <IoMdHeart className="text-destructive text-base" />
        ) : (
          <CiHeart className=" text-base" />
        )}
        <p>{formatNumber(likesCount)}</p>
      </Button>
      <Button size="icon" variant="outline" className="flex items-center   bg-transparent border-none text-xs justify-center gap-1  borde cursor-pointer rounded-full">
        <LiaComments className=" text-base " />
        <p>{formatNumber(commentsCount)}</p>
      </Button>
      <Button size="icon" variant="outline" className="flex items-center   bg-transparent border-none text-xs justify-center gap-1  borde cursor-pointer rounded-full" onClick={bookmarkOrUnbookmark} >
        {hasBookmarked ? <IoIosBookmark className="text-[#008080] text-base" /> : <CiBookmark className="text-base" />}
        
        <p>{formatNumber(bookmarksCount)}</p>
      </Button>
    </div>
  );
};
