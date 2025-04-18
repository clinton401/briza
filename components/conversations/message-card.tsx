import {FC} from "react";
import { MessageType } from "@/lib/types";
import {
    dateHandler,
    // timeAgoNumber,
  } from "@/lib/random-utils";


export const MessageCard: FC<{message: MessageType, userId: string}> = ({message, userId}) => {
    const isSender = message.senderId === userId;
    const messageDate = new Date(
        message.createdAt 
      );
    // const { amount, type } = timeAgoNumber(messageDate);
      const { monthText, dayOfMonth, year } =
        dateHandler(messageDate);
        function formatCustomTime(): string {
  let hours = messageDate.getHours();
  const minutes = messageDate.getMinutes().toString().padStart(2, "0");
  const isAM = hours < 12;


  if (hours === 0) {
    hours = 0;
  } else if (hours === 12 && isAM) {
    hours = 0;
  } else if (hours > 12) {
    hours = hours % 12;
  }

  return `${hours}:${minutes}${isAM ? "AM" : "PM"}`;
}

    return(
        <div className={`w-full flex flex-col justify-center ${ isSender ? "items-end": "items-start"}`}>
<p  className={`p-2 text-sm break-words max-w-[80%] rounded-lg ${
    isSender
      ? 'ml-auto bg-primary  rounded-tl-lg rounded-bl-lg rounded-br-lg'
      : 'mr-auto bg-secondary  rounded-tr-lg rounded-bl-lg rounded-br-lg'
  } whitespace-pre-line`}>{message.content}</p>
<p className="text-[10px] flex items-center gap-1">
{/* {type !== "w" && type !== "d" ? (
            <>
              {formatCustomTime()}
              
            </>
          ) : (
            <> */}
            <span> {formatCustomTime()}</span>
              <span> {monthText.slice(0, 3)} {dayOfMonth}, </span>
              <span>{year}</span>
            {/* </>
          )} */}
            
        </p>
        </div>
    )
}