"use client";
import { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  dateHandler,
  getUppercaseFirstLetter,
  timeAgoNumber,
} from "@/lib/random-utils";
import Link from "next/link";
import createToast from "@/hooks/create-toast";
import { unknown_error } from "@/lib/variables";
import { HoverCardUI } from "@/components/hover-card-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User2,
  Check,
  Dot,
  EllipsisVertical,
  Trash2,
  Loader,
} from "lucide-react";
import type { SessionType, PostWithDetails } from "@/lib/types";
import { Videos } from "@/components/videos";
import { Images } from "@/components/images";
import { PostMetrics } from "@/components/post/post-metrics";
import { MediaDialog } from "@/components/media-dialog";
import useCloseOnEscKey from "@/hooks/use-close-on-esc-key";
import { deletePost } from "@/actions/delete-post";
import useToggleFollow from "@/hooks/use-toggle-follow";
import { useQueryClient } from "@tanstack/react-query";
export const PostCard: FC<{
  session: SessionType;
  postDetails: PostWithDetails;
  isHomePage: boolean;
  searchQuery?: string;
   searchFilter?: "TOP" | "LATEST" | "MEDIA",
   userId?: string
}> = ({ session, postDetails, isHomePage, searchFilter, searchQuery, userId }) => {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [modalLinks, setModalLinks] = useState<
    | null
    | {
        id: string;
        url: string;
      }[]
  >(null);
  const [expanded, setExpanded] = useState(false);
  const maxLength = 200;
  const { isOpen: openModal, setIsOpen: setOpenModal } = useCloseOnEscKey();
  const { push, back } = useRouter();
  const queryClient = useQueryClient();
  const { createError, createSimple } = createToast();
  const { mutate: toggleFollow } = useToggleFollow();
  const { createdAt, content, user, media, metrics } = postDetails;

  const post_owner_profile_pic = user?.profilePictureUrl;
  const post_owner_username = user?.username;
  const post_owner_bio = user?.bio;
  const post_owner_name = user.name;
  const post_owner_id = user.id;
  const post_owner_account_created_at = user.createdAt;
  const is_post_owner_blue_verified = user.blueCheckVerified;
  const isFollowing = postDetails.isFollowing;
    useEffect(() => {
    if (media) {
      const links = media.map((file) => {
        return { id: file.id, url: file.mediaUrl };
      });
      setModalLinks(links);
    } else {
      setModalLinks(null);
    }
  }, [media]);

  if (
    !post_owner_profile_pic ||
    !post_owner_username ||
    !post_owner_bio ||
    !metrics ||
    metrics.likesCount === null ||
    metrics.commentsCount === null ||
    metrics.bookmarksCount === null ||
    metrics.viewsCount === null
  )
    return null;


  const uppercase_name = getUppercaseFirstLetter(post_owner_name);
  const uppercase_username = getUppercaseFirstLetter(post_owner_username);
  const joined_date = new Date(post_owner_account_created_at);
  const { year: joined_year, monthText } = dateHandler(joined_date);
  const postCreatedDate = new Date(createdAt); 
  const { amount, type } = timeAgoNumber(postCreatedDate);
  const {
    monthText: postMonthText,
    dayOfMonth: postDay,
    time: post_time,
    year: post_year,
  } = dateHandler(createdAt);
  const isCurrentYear =  post_year === new Date().getFullYear() ;
  const newMetrics = {
    id: metrics.id,
    postId: metrics.postId,
    likesCount: metrics.likesCount,
    commentsCount: metrics.commentsCount,
    bookmarksCount: metrics.bookmarksCount,
    viewsCount: metrics.viewsCount,
  };
  const modalHandler = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (!e) return;
    e.stopPropagation();
    if (openModal === false) {
      document.body.style.height = "auto";
      document.body.style.overflow = "auto";
    }
    setOpenModal(!openModal);
  };
  const imageModalHandler = (
    e: React.MouseEvent<HTMLDivElement>,
    id: string,
    url: string
  ) => {
    e.stopPropagation();
    if (!modalLinks) return;

    const filteredResult = modalLinks.filter((link) => {
      return link.id !== id;
    });
    const newData = {
      id,
      url,
    };
    const newModalLinks = [newData, ...filteredResult];
    setModalLinks(newModalLinks);
    modalHandler(e);
  };
  // const modal_links = media
  //   ? media.map((file) => {
  //       return { id: file.id, url: file.mediaUrl };
  //     })
  //   : null;
  // console.log(type)
  // const modal_links = modal_link ? [...modal_link, ...modal_link, ...modal_link, ...modal_link] : null;
  // const new_medias = media ? [...media, ...media, ...media] : null;
  const isCurrentUserOwnerOfPost = post_owner_id === session.id;

  const navigateHandler = () => {
    if (isHomePage) {
      push(`/status/${postDetails.id}`);
    }
  };
  const backHandler = () => {
    if (window.history.length > 1) {
      back();
    } else {
      push("/");
    }
  };
  const handleDeletePost = async () => {
    try {
      setIsDeleteLoading(true);
      const response = await deletePost(postDetails.id);
      const { error, success } = response;
      if (error || !success) {
        return createError(error || unknown_error);
      }
      await queryClient.invalidateQueries(
        {
          queryKey: ["posts"],
          exact: true,
          refetchType: "active",
        },
        {
          throwOnError: true,
          cancelRefetch: true,
        }
      );
      createSimple("Post deleted successfully");
      backHandler();
    } catch (error) {
      console.error(`Unable to delete post: ${error}`);
      createError(unknown_error);
    } finally {
      setIsDeleteLoading(false);
    }
  };
  const followOrUnfollow = async () => {
    toggleFollow(
      {
        postId: postDetails.id,
        value: !postDetails.isFollowing,
        userId: post_owner_id,
      },
      {
        onError: (error) => {
          console.error("Error toggling follow:", error);
        },
      }
    );
  };
  // const formatContent = (text: string) => {
  //   return text.split(/(\s+)/).map((part, index) => {
  //     if (part.startsWith("#")) {
  //       return (
  //         <Link
  //           key={index}
  //           href={`/search?q=${part.substring(1).toLowerCase()}`}
  //           className="text-blue-500 hover:underline active:underline focus:underline"
  //         >
  //           {part}
  //         </Link>
  //       );
  //     } else if (part.startsWith("http://") || part.startsWith("https://")) {
  //       return (
  //         <a
  //           key={index}
  //           href={part}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           className="text-green-500  hover:underline active:underline focus:underline"
  //         >
  //           {part}
  //         </a>
  //       );
  //     }
  //     return part;
  //   });
  // };
  const highlightSearchQuery = (text: string, searchQuery?: string) => {
    if (!searchQuery) return text;
  
    const regex = new RegExp(`(${searchQuery})`, "gi"); // Case-insensitive match
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <strong key={index} className="font-black">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };
   const stopPropagation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
   }
  const formatContent = (text: string, searchQuery?: string) => {
    return text.split(/(\s+)/).map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <Link
  key={index}
  href={`/search?q=${encodeURIComponent(part.toLowerCase())}`} 
  className="text-blue-500 hover:underline"
  onClick={stopPropagation}
>
{highlightSearchQuery(part, searchQuery)}
</Link>

        );
      } else if (part.startsWith("http://") || part.startsWith("https://")) {
        return (
          <a
          onClick={stopPropagation}
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 hover:underline"
          >
            {highlightSearchQuery(part, searchQuery)}
          </a>
        );
      }
  
    
      return highlightSearchQuery(part, searchQuery);
    });
  };
  return (
    <Card
      className={`w-full border-x-transparent rounded-none px-p-half  ${
        isHomePage ? "cursor-pointer " : ""
      } `}
      onClick={navigateHandler}
    >
      <CardHeader className=" py-4 px-0">
        <div className="flex w-full gap-2 items-center  justify-between">
          <div className="grow flex  h-11 items-center overflow-hidden gap-2">
            <HoverCardUI
              blueCheckVerified={is_post_owner_blue_verified}
              profilePictureUrl={post_owner_profile_pic}
              username={post_owner_username}
              bio={post_owner_bio}
              joined_month={monthText}
              joined_year={joined_year}
            >
              <Button
                variant="link"
                className="p-0"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();

                  push(`/user/${post_owner_id}`);
                }}
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

            <span className=" h-full w-3/4 truncate overflow-hidden  justify-center flex flex-col gap-1 text-xs">
              <span className=" flex truncate items-center">
                <Link
                  href={`/user/${post_owner_id}`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                    e.stopPropagation()
                  }
                  className="  w-auto hover:underline   flex items-center"
                >
                  {uppercase_name}

                  {is_post_owner_blue_verified && (
                    <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                      <Check className="h-2 w-2" />
                    </span>
                  )}
                </Link>
              </span>
              <span className=" flex truncate items-center">
                <Link
                  href={`/user/${post_owner_id}`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                    e.stopPropagation()
                  }
                  className="  w-auto hover:underline  text-muted-foreground"
                >
                  @{post_owner_username}
                </Link>
              </span>
            </span>
            {/* <span className=" h-[38px] ">
            <h6 className="text-xs">
            {amount}
            {type}
          </h6>
            </span> */}
          </div>
          {isHomePage ? (
            <>
              {type !== "w" ? (
                <h6 className="text-xs">
                  {amount}
                  {type}
                </h6>
              ) : (
                <h6 className="text-xs flex items-center gap-1">
                  <span> {postMonthText.slice(0, 3)} </span>
                  <span>
                    {postDay} {!isCurrentYear && <>,  {post_year}</>}
                   </span>
                </h6>
              )}
            </>
          ) : (
            <>
              {isDeleteLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-none"
                    >
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className=" w-60">
                    {isCurrentUserOwnerOfPost && (
                      <DropdownMenuItem
                        className="flex cursor-pointer items-center text-destructive truncate "
                        onClick={handleDeletePost}
                      >
                        <Trash2 className="mr-1" />
                        Delete
                      </DropdownMenuItem>
                    )}
                    {!isCurrentUserOwnerOfPost && (
                      <DropdownMenuItem
                        className="flex cursor-pointer items-center truncate "
                        onClick={followOrUnfollow}
                      >
                        <User2 className="mr-1" />
                        {isFollowing ? "Unfollow " : "Follow "}@
                        {post_owner_username}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col px-0 gap-y-4">
        {content && (
          <p className="w-full ">
            {/* {content} */}
            {isHomePage ? (
              <>
                {formatContent(
                  expanded ? content : content.slice(0, maxLength),
                  searchQuery
                )}
                {content.length > maxLength && !expanded && (
                  <Button
                    onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                      e.stopPropagation();
                      setExpanded(true);
                    }}
                    className="text-[#1DA1F2] p-0 h-auto hover:bg-transparent focus:bg-transparent bg-transparent hover:underline focus:underline  ml-2"
                  >
                    See More
                  </Button>
                )}
              </>
            ) : (
              <>{formatContent(content, searchQuery)}</>
            )}
          </p>
        )}
        {media && (
          <>
            {media.length === 1 && (
              <>
                {media[0].mediaType === "VIDEO" ? (
                  <div
                    className="w-full max-h-[400px] aspect-video"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                      e.stopPropagation()
                    }
                  >
                    <Videos url={media[0].mediaUrl} />
                  </div>
                ) : (
                  <div
                    className="w-full max-h-[400px] aspect-square rounded-lg cursor-pointer "
                    onClick={modalHandler}
                  >
                    <Images imgSrc={media[0].mediaUrl} alt={`Post Image`} />
                  </div>
                )}
              </>
            )}
          </>
        )}
        {media && (media.length === 2 || media.length === 4) && (
          <div className="w-full  flex gap-1 flex-wrap divide-background items-center ">
            {media.map((file, index) => {
              if (file.mediaType === "VIDEO") return;
              return (
                <div
                  className={`post_images aspect-square max-h-[400px] overflow-hidden rounded-lg cursor-pointer `}
                  key={index}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                    imageModalHandler(e, file.id, file.mediaUrl)
                  }
                >
                  <Images imgSrc={file.mediaUrl} alt={`Post Image`} />
                </div>
              );
            })}
          </div>
        )}

        {media && media.length === 3 && (
          <div className="w-full flex gap-1 divide-background flex-wrap items-center ">
            {media.slice(0, 2).map((file, index) => {
              if (file.mediaType === "VIDEO") return;
              return (
                <div
                  className="post_images max-h-[400px] cursor-pointer  aspect-square overflow-hidden rounded-lg "
                  key={index}
                  onClick={modalHandler}
                >
                  <Images imgSrc={file.mediaUrl} alt={`Post Image`} />
                </div>
              );
            })}
            {media[2].mediaType !== "VIDEO" && (
              <div
                className="w-full max-h-[200px] aspect-video cursor-pointer overflow-hidden rounded-lg "
                onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                  imageModalHandler(e, media[2].id, media[2].mediaUrl)
                }
              >
                <Images imgSrc={media[2].mediaUrl} alt={`Post Image`} />
              </div>
            )}
          </div>
        )}
        {!isHomePage && (
          <ul className="w-full flex text-muted-foreground   gap-1  items-center text-xs">
            <li className="">{post_time}</li>
            <li className="">
              <Dot className="h-2 w-2" />
            </li>

            <li>
              {postMonthText.slice(0, 3)} {postDay}, {post_year}
            </li>
          </ul>
        )}

        <PostMetrics
          metrics={newMetrics}
          hasLiked={postDetails.hasLiked}
          hasBookmarked={postDetails.hasBookmarked}
          postDetails={postDetails}
          userId={userId}
          searchQuery={searchQuery}
          searchFilter={searchFilter}
          sessionId={session.id}
        />
        {openModal && modalLinks && (
          <MediaDialog
            isOpen={openModal}
            userId={userId}
            sessionId={session.id}
            closeModal={modalHandler}
            media={modalLinks}
            hasLiked={postDetails.hasLiked}
            hasBookmarked={postDetails.hasBookmarked}
            postMetrics={newMetrics}
            postDetails={postDetails}
            searchQuery={searchQuery}
            searchFilter={searchFilter}
          />
        )}
      </CardContent>
    </Card>
  );
};
