import { FC } from "react";
import { User2, Check  } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NotFollowedUsers } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link"
  import { HoverCardUI } from "@/components/hover-card-ui";
  import {useRouter} from "next/navigation";
  import { dateHandler, getUppercaseFirstLetter } from "@/lib/random-utils";
export const NotFollowedCard: FC<{ user: NotFollowedUsers }> = ({ user }) => {
  const { id,  username, profilePicturePublicId, profilePictureUrl, name, bio, createdAt, blueCheckVerified } =
    user;
  if ( !id ||  !username || !profilePicturePublicId || !profilePictureUrl || !name || !bio ||! createdAt)
    return null;
  const {push} = useRouter();
  const uppercase_name = getUppercaseFirstLetter(name);
  const uppercase_username = getUppercaseFirstLetter(username);
    const joined_date = new Date(createdAt);
    const {year: joined_year , monthText} = dateHandler(joined_date);
 
 
  return (
    <div className="flex w-full gap-2 items-center  justify-between">
      <div className="grow flex items-center gap-2">
      <HoverCardUI profilePictureUrl={profilePictureUrl} username={uppercase_username} bio={bio} joined_month={monthText} joined_year={joined_year} blueCheckVerified={blueCheckVerified}>
        <Button  variant="link" className="p-0" onClick={()=> push(`/user/${username}`)}>
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
    
       
        <span className=" w-[158px]  justify-center  flex flex-col gap-1 text-xs">
      

        <Link href={`/user/${username}`} className="w-full  flex items-center truncate">
       {uppercase_name}
        {blueCheckVerified && <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">

<Check className="h-2 w-2"/>
</span>}
        </Link>
     

    
      

        <Link href={`/user/${username}`} className="w-full flex truncate text-muted-foreground">
        @{uppercase_username}
        

        </Link>
     

    
          
        </span>
      </div>
      <Button className="rounded-full text-sm " >
        Follow
      </Button>
    </div>
  );
};
