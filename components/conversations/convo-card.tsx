import { FC } from "react";
import { ConversationType } from "@/lib/types";
import { Button } from "../ui/button";
import { useRouter, useParams } from "next/navigation";
import {  User2, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  dateHandler,
  getUppercaseFirstLetter,
  timeAgoNumber,
} from "@/lib/random-utils";

export const ConvoCard: FC<{ conversation: ConversationType }> = ({
  conversation,
}) => {
  const {push } = useRouter();
  const {id} = useParams();
  const convoDate = new Date(
    conversation.lastMessageAt || conversation.updatedAt
  );
  const { amount, type } = timeAgoNumber(convoDate);
  const { monthText: convoMonth, dayOfMonth: convoDay, year } =
    dateHandler(convoDate);
    const uppercaseName = getUppercaseFirstLetter(conversation.user.name)
  return (
    <Button
      className={`w-full flex justify-between ${id && id === conversation.id ? "bg-secondary/60" : ""} items-center rounded-none border-none h-auto px-p-half gap-4`}
      variant="outline"
      onClick={() => push(`/messages/${conversation.id}`)}

    >
      <div className="w-3/4 min-w-[150px] flex items-center gap-2">
        <Avatar className="">
          <AvatarImage
            src={conversation.user?.profilePictureUrl || ""}
            alt="User profile picture"
          />
          <AvatarFallback>
            <User2 />
          </AvatarFallback>
        </Avatar>
        <div className=" flex grow items-start flex-col overflow-hidden  justify-center gap-1">
          <p className="truncate text-left text-xs flex items-center  w-full">
            {uppercaseName}
            {conversation.user.blueCheckVerified && (
              <span className="h-4 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                <Check className="h-1 w-1" />
              </span>
            )}
          </p>
          <p className="text-muted-foreground text-xs  truncate text-left w-full">
            {conversation.lastMessage}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-1">
        <p className="text-xs flex items-center gap-1">
          {" "}
          {type !== "w" && type !== "d" ? (
            <>
              {amount} {type}
            </>
          ) : (
            <>
              <span> {convoMonth.slice(0, 3)} {convoDay}, </span>
              <span>{year}</span>
            </>
          )}
        </p>
        {!conversation.isRead && (
            <div className="h-2 w-2 rounded-full bg-primary"/>
        )}
      </div>
    </Button>
  );
};
