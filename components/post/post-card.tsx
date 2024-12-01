"use client"
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  dateHandler,
  getUppercaseFirstLetter,
  timeAgoNumber,
} from "@/lib/random-utils";
import Link from "next/link";

import { HoverCardUI } from "@/components/hover-card-ui";

import { User2, Check } from "lucide-react";
import type { SessionType, PostWithDetails } from "@/lib/types";
import { Videos } from "@/components/videos";
import { Images } from "@/components/images";
import {PostMetrics} from "@/components/post/post-metrics";
import {MediaDialog} from "@/components/media-dialog";
import useCloseOnEscKey from "@/hooks/use-close-on-esc-key";
export const PostCard: FC<{
  session: SessionType;
  postDetails: PostWithDetails;
}> = ({ session, postDetails }) => {

  const [hasLiked, setHasLiked] = useState(postDetails.hasLiked);
  const [hasBookmarked, setHasBookmarked] = useState(postDetails.hasBookmarked);
  // const [openModal, setOpenModal] = useState(false);
  const {isOpen: openModal, setIsOpen: setOpenModal} = useCloseOnEscKey()
  const { push } = useRouter();
  const {createdAt,  content, user, media, metrics } = postDetails;

  const post_owner_profile_pic = user?.profilePictureUrl;
  const post_owner_username = user?.username;
  const post_owner_bio = user?.bio;
  const post_owner_name = user.name;
  const post_owner_account_created_at = user.createdAt;
  const is_post_owner_blue_verified = user.blueCheckVerified;
  if (!post_owner_profile_pic || !post_owner_username || !post_owner_bio  ||!metrics || metrics.likesCount === null || 
    metrics.commentsCount === null || 
    metrics.bookmarksCount === null || 
    metrics.viewsCount === null)
    return null;
  const uppercase_name = getUppercaseFirstLetter(post_owner_name);
  const uppercase_username = getUppercaseFirstLetter(post_owner_username);
  const joined_date = new Date(post_owner_account_created_at);
  const { year: joined_year, monthText } = dateHandler(joined_date);
  const postCreatedDate = new Date(createdAt)
  const { amount, type } = timeAgoNumber(postCreatedDate);
  const {monthText: postMonthText, dayOfMonth: postDay} = dateHandler(createdAt)
const newMetrics = {
  id: metrics.id,
  postId: metrics.postId,
    likesCount: metrics.likesCount,
    commentsCount: metrics.commentsCount,
    bookmarksCount: metrics.bookmarksCount,
    viewsCount: metrics.viewsCount
}
const modalHandler = (e: React.MouseEvent<HTMLDivElement>) => {
  e.stopPropagation();
  if(openModal === false) {
    document.body.style.height = "auto";
    document.body.style.overflow =  "auto";
  }
  setOpenModal(!openModal)
 
}
const modal_link = media ? media.map((file) => {
 
  return {id: file.id,
    url: file.mediaUrl
    
  }
}) : null;
const modal_links = modal_link ? [...modal_link, ...modal_link, ...modal_link, ...modal_link] : null;
// const new_medias = media ? [...media, ...media, ...media] : null;
  return (
    <Card className="w-full cursor-pointer" onClick={() => push(`status/${postDetails.id}`)} >
      <CardHeader className="py-4">
      <div className="flex w-full gap-2 items-center  justify-between">
          <div className="grow flex  h-11 items-center overflow-hidden gap-2">
            <HoverCardUI
            blueCheckVerified={is_post_owner_blue_verified}
              profilePictureUrl={post_owner_profile_pic}
              username={uppercase_username}
              bio={post_owner_bio}
              joined_month={monthText}
              joined_year={joined_year}
            >
              <Button
                variant="link"
                className="p-0"
                onClick={() => push(`/user/${post_owner_username}`)}
              >
                {/* <Link href={`/user/${id}`} > */}

                <Avatar>
                  <AvatarImage
                    src={post_owner_profile_pic}
                    alt={`${uppercase_username} profile picture`}
                  />
                  <AvatarFallback>
                    <User2 />
                  </AvatarFallback>
                </Avatar>
                {/* </Link> */}
              </Button>
            </HoverCardUI>

            <span className=" h-full w-3/4 truncate  justify-center flex flex-col gap-1 text-xs">
              <Link
                href={`/user/${post_owner_username}`}
                className=" truncate w-full  flex items-center"
              >
                {uppercase_name}
                
                {is_post_owner_blue_verified && <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">

<Check className="h-2 w-2"/>
</span>}
             
              </Link>

              <Link
                href={`/user/${post_owner_username}`}
                className=" truncate text-muted-foreground"
              >
                
                @{uppercase_username}
                
              </Link>
            </span>
            {/* <span className=" h-[38px] ">
            <h6 className="text-xs">
            {amount}
            {type}
          </h6>
            </span> */}
            
          </div>
          {type === "d" ? <h6 className="text-xs">
            {amount}
            {type}
          </h6>: <h6 className="text-xs flex items-center gap-1">
           <span> {postMonthText.slice(0, 3)}</span>
            <span>{postDay}</span >
          </h6>}
          
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        
        {content && <p className="w-full ">{content}</p>}
        {media && (
          <>
            {media.length === 1 && (
              <>
                {media[0].mediaType === "VIDEO" ? (
                  <div className="w-full max-h-[400px] aspect-video">
                    <Videos url={media[0].mediaUrl}  />
                  </div>
                ) : (
                  <div className="w-full max-h-[400px] aspect-video rounded-lg "  onClick={modalHandler}>
                    <Images  imgSrc={media[0].mediaUrl} alt={`Post Image`}/>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {media && (media.length === 2 || media.length === 4) &&  <div className="w-full  flex gap-1 flex-wrap divide-background items-center ">
          {media.map((file, index) => {
            if(file.mediaType === "VIDEO") return ;
            return  <div className={`post_images ${media.length === 4 ? "aspect-video" : "aspect-square"} max-h-[400px] overflow-hidden rounded-lg `}  key={index} onClick={modalHandler}>
            <Images  imgSrc={file.mediaUrl} alt={`Post Image`}/>
          </div>
          })}
          </div>}
        
        {media && media.length === 3 &&  <div className="w-full flex gap-1 divide-background flex-wrap items-center ">
          {media.slice(0,2).map((file, index) => {
            if(file.mediaType === "VIDEO") return ;
            return  <div className="post_images max-h-[400px]  aspect-video overflow-hidden rounded-lg "  key={index} onClick={modalHandler}>
            <Images  imgSrc={file.mediaUrl} alt={`Post Image`}/>
          </div>
          })}
          {media[2].mediaType !== "VIDEO" &&  <div className="w-full max-h-[200px] aspect-video overflow-hidden rounded-lg "   onClick={modalHandler}>
            <Images  imgSrc={media[2].mediaUrl} alt={`Post Image`}/>
          </div>}
        
          </div>}
        <PostMetrics metrics={newMetrics} hasLiked={hasLiked} setHasLiked={setHasLiked} hasBookmarked={hasBookmarked} setHasBookmarked={setHasBookmarked}/>
        {openModal && modal_links && <MediaDialog isOpen={openModal} closeModal={modalHandler} media={modal_links}  hasLiked={hasLiked} setHasLiked={setHasLiked} hasBookmarked={hasBookmarked} setHasBookmarked={setHasBookmarked} postMetrics={newMetrics}/>}
      </CardContent>
    </Card>
  );
};
