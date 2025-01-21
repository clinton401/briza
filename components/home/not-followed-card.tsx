import { FC } from "react";
import { User2, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NotFollowedUsers } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HoverCardUI } from "@/components/hover-card-ui";
import { useParams, usePathname, useRouter } from "next/navigation";
import useToggleFollow from "@/hooks/use-toggle-follow";
import { dateHandler, getUppercaseFirstLetter } from "@/lib/random-utils";
export const NotFollowedCard: FC<{ user: NotFollowedUsers }> = ({ user }) => {
  const {
    id,
    username,
    profilePicturePublicId,
    profilePictureUrl,
    name,
    bio,
    createdAt,
    blueCheckVerified,
    hasFollowed
  } = user;
  if (
    !id ||
    !username ||
    !profilePicturePublicId ||
    !profilePictureUrl ||
    !name ||
    !bio ||
    !createdAt
  )
    return null;
  const { push } = useRouter();
  const pathname = usePathname();
  const {id: postId} = useParams();
  const {mutate: toggleFollow} = useToggleFollow();
  const uppercase_name = getUppercaseFirstLetter(name);
  // const uppercase_username = getUppercaseFirstLetter(username);
  const joined_date = new Date(createdAt);
  const { year: joined_year, monthText } = dateHandler(joined_date);
  const followHandler = () => {
     const validId = Array.isArray(postId) ? postId[0] : postId;
    toggleFollow(
      {
        userId: id,
        value: !hasFollowed,
        postId: pathname.startsWith("/status/") && validId ? validId : undefined
        // userId: post_owner_id
      },
      {
        onError: (error) => {
          console.error("Error toggling follow:", error);
        },
      }
    );
  }

  return (
    <div className="flex w-full gap-2 items-center  justify-between">
      <div className="grow flex items-center gap-2">
        <HoverCardUI
          profilePictureUrl={profilePictureUrl}
          username={username}
          bio={bio}
          joined_month={monthText}
          joined_year={joined_year}
          blueCheckVerified={blueCheckVerified}
        >
          <Button
            variant="link"
            className="p-0"
            onClick={() => push(`/user/${username}`)}
          >
            {/* <Link href={`/user/${id}`} > */}

            <Avatar>
              <AvatarImage
                src={profilePictureUrl}
                alt={`${username} profile picture`}
              />
              <AvatarFallback>
                <User2 />
              </AvatarFallback>
            </Avatar>
            {/* </Link> */}
          </Button>
        </HoverCardUI>

        <div className=" w-[150px]  justify-center  flex flex-col gap-1 text-xs">
          <span className=" flex truncate items-center">
            <Link
              href={`/user/${username}`}
              className="  w-auto hover:underline   flex items-center"
            >
              {uppercase_name}

              {blueCheckVerified && (
                <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                  <Check className="h-2 w-2" />
                </span>
              )}
            </Link>
          </span>
          <span className=" flex truncate items-center">
            <Link
              href={`/user/${username}`}
              className="  w-auto hover:underline  text-muted-foreground"
            >
              @{username}
            </Link>
          </span>
          {/* <Link
            href={`/user/${username}`}
            className="w-full  flex items-center truncate border"
          >
            {uppercase_name}
            {blueCheckVerified && (
              <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                <Check className="h-2 w-2" />
              </span>
            )}
          </Link>

          <Link
            href={`/user/${username}`}
            className="w-full flex truncate text-muted-foreground"
          >
            @{username}
          </Link> */}
        </div>
      </div>
      <Button className="rounded-full text-sm " variant={hasFollowed ? "outline": "default"} onClick={followHandler}>
        {hasFollowed ? "Unfollow": "Follow"}
    
        
        </Button>
    </div>
  );
};
