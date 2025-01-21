import {FC, ReactNode} from "react";

import { User2, CalendarIcon, Check  } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
type HoverCardProps = {
  profilePictureUrl: string,
  username: string,
  bio: string,
  joined_month: string,
  joined_year: number,
  children: ReactNode,
  isButtonOrLink? : boolean,
  blueCheckVerified: boolean
}
export const HoverCardUI:FC<HoverCardProps> = ({profilePictureUrl, username, joined_year, joined_month, bio, children, isButtonOrLink = true, blueCheckVerified}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild={isButtonOrLink}>
     {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-full max-w-80">
      <div className="flex  space-x-4">
          <Avatar>
            <AvatarImage src={profilePictureUrl}
            alt={`${username} profile picture`} />
            <AvatarFallback><User2 /></AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold flex items-center">@{username}

              {blueCheckVerified && <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">

<Check className="h-2 w-2"/>
</span>}
              
            </h4>
            <p className="text-sm">
              {bio}
            </p>
            <div className="flex items-center pt-2">
              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
              <span className="text-xs text-muted-foreground">
                Joined {joined_month} {joined_year}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
