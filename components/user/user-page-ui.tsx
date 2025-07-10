"use client";
import { FC, useState, useEffect } from "react";
import type { SessionType, UserResponse, ImageModal } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ArrowLeft, User2, Check, ExternalLink, CalendarDays  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notable } from "@/lib/fonts";
import fetchData from "@/hooks/fetch-data";
import PostLoadingPage from "@/app/status/[id]/loading";
import { ErrorComp } from "@/components/error-comp";
import { unknown_error } from "@/lib/variables";
import {  QueryFunctionContext } from "@tanstack/react-query";
import { formatNumber, dateHandler } from "@/lib/random-utils";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import {MediaDialog} from "@/components/media-dialog"
import { Images } from "@/components/images";
import useCloseOnEscKey from "@/hooks/use-close-on-esc-key";
import useToggleFollow from "@/hooks/use-toggle-follow";
import Link from "next/link";
import {UserPagePosts} from "@/components/user/user-page-posts";
import {UserEditSheet} from "@/components/user/user-edit-sheet";
import { getUppercaseFirstLetter } from "@/lib/random-utils";
type DialogType = ImageModal & {
    isProfile: boolean
}

type UserPageUIProps = {
  session: SessionType;
  id: string;
};

type UserQueryKey = ["user",  string];

export const UserPageUI: FC<UserPageUIProps> = ({ session, id }) => {
    const [modalUrls, setModalUrls] = useState<DialogType[] | null>(null);
    const [filter, setFilter] = useState<"POSTS"  | "BOOKMARKS" | "LIKES">("POSTS")
   

    const { isOpen: openModal, setIsOpen: setOpenModal } = useCloseOnEscKey();
    // const { isOpen: openEditModal, setIsOpen: setOpenEditModal } = useCloseOnEscKey();
    
  const fetchUser = async ({
    // queryKey,
    signal,
  }: QueryFunctionContext<UserQueryKey>): Promise<UserResponse> => {
    const response = await fetch(`/api/users/${id}`, { signal });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || unknown_error);
    }
    const data = await response.json();

    return data;
  };

  const {
    data: user,
    error,
    isLoading,
    refetch
  } = fetchData<UserResponse, UserQueryKey>(
    ["user", id],
    fetchUser,
    {
      enabled: !!id,
    }
  );
  const { back, push } = useRouter();
  
  
  const {mutate: toggleFollow} = useToggleFollow();
  
  const userId = id
  
  const isOwnProfile = userId === session.id;
  useEffect(() => {
    if(!isOwnProfile && filter === "BOOKMARKS") {
      setFilter("POSTS")
    }
  }, [isOwnProfile, filter, id, session.id] )
  const modalHandler = (e?: React.MouseEvent<HTMLDivElement>) => {
    if(!e) return;
    e.stopPropagation();
    setOpenModal(!openModal);
  };
 
  
  const imageModalHandler = (e: React.MouseEvent<HTMLDivElement>, data: DialogType) => {
    e.stopPropagation();
    
    setModalUrls([data]);
    modalHandler(e)
  }
  const getValidDialogArray = (data: DialogType[]): ImageModal[] => {
    return data.map(urls => {
      return { url: urls.url, id: urls.id }; 
    });
  };
  
 
  if (isLoading) {
    return <PostLoadingPage />;
  }
  if (error || !user) {
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
  const followHandler = () => {
   toggleFollow(
     {
       userId: userId,
       value: !user.isFollowing,
      //  followId: userId
       // userId: post_owner_id
     },
     {
       onError: (error) => {
         console.error("Error toggling follow:", error);
       },
     }
   );
 }
 const {
  monthText,
  year,
} = dateHandler(user.createdAt);
const tabs = ["Posts", "Likes", "Bookmarks"]

  return (
    <div className="w-full pb-16 md:pb-8 min-h-dvh   ">
      <section className="flex justify-between gap-x-2 gap-y-4 px-p-half border-b border z-50 sticky flex-wrap bg-background top-0 left-0  w-full items-center py-2">
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full items-center justify-center border-none"
            onClick={backHandler}
          >
            <ArrowLeft  />
          </Button>
          <span className="flex  gap-1 flex-col">
            <h2 className={`font-bold text-lg ${notable.className}`}>
              {getUppercaseFirstLetter(user.name)}
            </h2>
            <p className="text-xs">
              {formatNumber(user.metrics?.postCount || 0)} posts
            </p>
          </span>
        </div>
      </section>
      <section className="w-full  relative">
        <div
          className={`relative w-full aspect-[1/0.3] ${
            !user.coverPhotoUrl ? "bg-secondary" : "cursor-pointer "
          }`}
          // style={{
          //   backgroundImage:
          //   user.coverPhotoUrl
          //       ? `url(${user.coverPhotoUrl})`
          //       : "none",
          //   backgroundSize: "cover",
          //   backgroundRepeat: "no-repeat",
          // }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if(!user.coverPhotoUrl ) return;
            imageModalHandler(e, {
               url: user.coverPhotoUrl,
               id: user.coverPhotoPublicId  as string,
               isProfile: false
            })
        }}
        >
          {user.coverPhotoUrl && (
            <Images imgSrc={user.coverPhotoUrl} alt="User cover photo" />
          )}
<Avatar className={`w-[120px] absolute bottom-[-60px] left-p-half  h-[120px]  ${
            !user.profilePictureUrl ? "" : "cursor-pointer "
          } `}  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if(!user.profilePictureUrl ) return;
            imageModalHandler(e, {
               url: user.profilePictureUrl,
               id: user.profilePicturePublicId  as string,
               isProfile: true
            })
        }}>
      <AvatarImage src={user.profilePictureUrl || ""} alt="profile picture" />
      <AvatarFallback><User2/></AvatarFallback>
    </Avatar>

        </div>
       
        <div className="w-full justify-end flex items-center px-p-half py-2">
        {!isOwnProfile ? <>

            <Button className="rounded-full text-sm " variant={user.isFollowing ? "outline": "default"} onClick={followHandler}>
        {user.isFollowing ? "Unfollow": "Follow"}
    
        
        </Button>
          </> : <UserEditSheet user={user} session={session} />}
        </div>
      
      </section>
      <section className="pt-[25px]  w-full px-p-half flex flex-col gap-3">
<div className="w-full flex-col gap-1  flex">
    <h2 className={`${notable.className} font-black flex items-center`}>{getUppercaseFirstLetter(user.name)} {user.blueCheckVerified && (
                    <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                      <Check className="h-2 w-2" />
                    </span>
                  )}</h2>

                  <p className="text-sm text-muted-foreground">
@{user.username?.toLowerCase()}
                  </p>
</div>
{user.bio && <p className="w-full"> {user.bio}</p>}
<div className="w-full gap-y-1 gap-x-4 flex flex-wrap items-center">


    {user.website && <a  href={user.website} target="_blank" rel="noopener noreferrer" className="items-center text-sm text-primary flex">{user.websiteName || user.website} <ExternalLink className="h-4 w-4 ml-1 "/></a>}
    <p className="text-sm text-muted-foreground flex items-center"><CalendarDays className="h-4 w-4 mr-1"/> Joined {monthText} {year}</p>
</div>
<div className="w-full gap-y-1 gap-x-4 flex flex-wrap items-center">
  <Link href={`/user/${id}/following`} className="text-sm  hover:underline text-muted-foreground"><span className={`text-base text-white  font-black ${notable.className}`}>{formatNumber(user.metrics?.followingCount || 0)} </span>Following</Link>
  <Link href={`/user/${id}/followers`} className="text-sm  hover:underline text-muted-foreground"><span className={`text-base  text-white font-black ${notable.className}`}> {formatNumber(user.metrics?.followersCount || 0)} </span>Followers</Link>
</div>
      </section>
      <section className="w-full pt-8 ">
        <ul className="w-full border-b flex items-center  pb-6 justify-evenly ">
        {tabs.map((tab) => {
          if(!isOwnProfile && tab === "Bookmarks") return null

          return <li key={tab}>
          <Button variant={filter.toLowerCase() === tab.toLowerCase() ? "default" : "outline"} onClick={() => setFilter(tab.toUpperCase() as "POSTS"  | "BOOKMARKS" | "LIKES" )}>{tab}</Button>
          </li>

        })}
        
        </ul>
      </section>

      <UserPagePosts userId={userId} filter={filter} session={session}/>
      {openModal && modalUrls && (
          <MediaDialog
          userId={userId}
          sessionId={session.id}
            isOpen={openModal}
            closeModal={modalHandler}
            media={getValidDialogArray(modalUrls)}
            isPostMedia={false}
            isProfilePic={modalUrls[0].isProfile}
          />
        )}
    </div>
  );
};
