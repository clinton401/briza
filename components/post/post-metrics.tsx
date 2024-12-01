import { FC, Dispatch, SetStateAction } from "react";
import { Eye, Heart, MessageSquareText, Bookmark } from "lucide-react";
import { CiHeart, CiBookmark } from "react-icons/ci";
import { IoMdHeart, IoIosBookmark } from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import { LiaComments } from "react-icons/lia";
import { formatNumber } from "@/lib/random-utils";
import {PostMetricsTypes} from "@/lib/types"
type PostMetricsProps = {
  setHasLiked: Dispatch<SetStateAction<boolean>>;
  setHasBookmarked: Dispatch<SetStateAction<boolean>>;
  hasLiked: boolean;
  hasBookmarked: boolean;
  metrics: PostMetricsTypes
};
export const PostMetrics: FC<PostMetricsProps> = ({
  metrics,
  hasLiked,
  hasBookmarked,
}) => {
  const { likesCount, commentsCount, bookmarksCount, viewsCount } = metrics;
  return (
    <div className="flex items-center justify-between *:text-xs ">
      <span className="flex items-center text-xs justify-center gap-1  borde cursor-pointer rounded-full">
        <IoEyeOutline className=" text-base " />
        <p>{formatNumber(viewsCount)}</p>
      </span>
      <span className="flex items-center text-xs justify-center gap-1  borde cursor-pointer rounded-full">
        {hasLiked ? (
          <IoMdHeart className="text-destructive text-base" />
        ) : (
          <CiHeart className=" text-base" />
        )}
        <p>{formatNumber(likesCount)}</p>
      </span>
      <span className="flex items-center text-xs justify-center gap-1  borde cursor-pointer rounded-full">
        <LiaComments className=" text-base " />
        <p>{formatNumber(commentsCount)}</p>
      </span>
      <span className="flex items-center text-xs justify-center gap-1  borde cursor-pointer rounded-full">
        {hasBookmarked ? <IoIosBookmark className="text-secondary text-base" /> : <CiBookmark className="text-base" />}
        
        <p>{formatNumber(bookmarksCount)}</p>
      </span>
    </div>
  );
};
