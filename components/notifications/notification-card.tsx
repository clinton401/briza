import { FC } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  Check,
  Inbox,
  User2,
} from "lucide-react";
import { motion } from "motion/react";
import { IoMdHeart } from "react-icons/io";
import { NotificationWithTriggeredBy, NotificationType } from "@/lib/types";
import { timeAgoNumber, dateHandler, getUppercaseFirstLetter } from "@/lib/random-utils";
import { Button } from "@/components/ui/button";
import { HoverCardUI } from "@/components/hover-card-ui";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LiaComments } from "react-icons/lia";
import Link from "next/link";

export const NotificationCard: FC<{
  notification: NotificationWithTriggeredBy;
  index: number;
}> = ({ notification, index }) => {
  const { createdAt, triggeredBy, isRead, type, url } = notification;
  const { amount, type: timeType } = timeAgoNumber(createdAt);
  const { push } = useRouter();
  if (
    !triggeredBy ||
    !triggeredBy.profilePictureUrl ||
    !triggeredBy.username ||
    !triggeredBy.bio
  )
    return null;
  const { year: joined_year, monthText } = dateHandler(triggeredBy.createdAt);
  if (type === NotificationType.LIKE) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => push(url)}
        className={`flex items-center border-b cursor-pointer hover:bg-sidebar-accent transition-colors duration-300 ease-in py-4 px-p-half ${
          isRead ? "" : "bg-sidebar-hover"
        }`}
      >
        <div className="mr-4 gap-x-4  relative  flex items-center justify-center ">
          {/* <Heart className="h-5 w-5" /> */}

          <HoverCardUI
            profilePictureUrl={triggeredBy.profilePictureUrl}
            username={triggeredBy.username}
            bio={triggeredBy.bio}
            joined_month={monthText}
            joined_year={joined_year}
            blueCheckVerified={triggeredBy.blueCheckVerified}
          >
            <Button
              variant="link"
              className="p-0"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                push(`/user/${triggeredBy.id}`);
              }}
            >
              {/* <Link href={`/user/${id}`} > */}

              <Avatar>
                <AvatarImage
                  src={triggeredBy.profilePictureUrl}
                  alt={`${triggeredBy.username} profile picture`}
                />
                <AvatarFallback>
                  <User2 />
                </AvatarFallback>
              </Avatar>
              {/* </Link> */}
            </Button>
          </HoverCardUI>
          <span className="bg-destructive h-5 aspect-square rounded-full absolute top-5 left-6 flex items-center justify-center">
            <IoMdHeart className=" text-xs " />
          </span>
        </div>
        <div className="flex-grow">
          <p className={`text-sm `}>
            <Link
              className="font-semibold hover:underline"
              href={`/user/${triggeredBy.id}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
              }}
            >
              {getUppercaseFirstLetter(triggeredBy.name)}
            </Link>{" "}
            liked your post
          </p>
          <p className="text-xs ">
            {amount}
            {timeType}
          </p>
        </div>
      </motion.div>
    );
  }
  if (type === NotificationType.LIKE_COMMENT) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => push(url)}
        className={`flex items-center border-b cursor-pointer hover:bg-sidebar-accent transition-colors duration-300 ease-in py-4 px-p-half ${
            isRead ? "" : "bg-sidebar-hover"
          }`}
      >
        <div className="mr-4 gap-x-4  relative  flex items-center justify-center ">
          {/* <Heart className="h-5 w-5" /> */}

          <HoverCardUI
            profilePictureUrl={triggeredBy.profilePictureUrl}
            username={triggeredBy.username}
            bio={triggeredBy.bio}
            joined_month={monthText}
            joined_year={joined_year}
            blueCheckVerified={triggeredBy.blueCheckVerified}
          >
            <Button
              variant="link"
              className="p-0"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                push(`/user/${triggeredBy.id}`);
              }}
            >
              {/* <Link href={`/user/${id}`} > */}

              <Avatar>
                <AvatarImage
                  src={triggeredBy.profilePictureUrl}
                  alt={`${triggeredBy.username} profile picture`}
                />
                <AvatarFallback>
                  <User2 />
                </AvatarFallback>
              </Avatar>
              {/* </Link> */}
            </Button>
          </HoverCardUI>
          <span className="bg-destructive h-5 aspect-square rounded-full absolute top-5 left-6 flex items-center justify-center">
            <IoMdHeart className=" text-xs " />
          </span>
        </div>
        <div className="flex-grow">
          <p className={`text-sm `}>
            <Link
              className="font-semibold hover:underline"
              href={`/user/${triggeredBy.id}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
              }}
            >
              {getUppercaseFirstLetter(triggeredBy.name)}
            </Link>{" "}
            liked your comment
          </p>
          <p className="text-xs ">
            {amount}
            {timeType}
          </p>
        </div>
      </motion.div>
    );
  }
  if (type === NotificationType.COMMENT) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => push(url)}
        className={`flex items-center border-b cursor-pointer hover:bg-sidebar-accent transition-colors duration-300 ease-in py-4 px-p-half ${
            isRead ? "" : "bg-sidebar-hover"
          }`}
      >
        <div className="mr-4 gap-x-4  relative  flex items-center justify-center ">
          {/* <Heart className="h-5 w-5" /> */}

          <HoverCardUI
            profilePictureUrl={triggeredBy.profilePictureUrl}
            username={triggeredBy.username}
            bio={triggeredBy.bio}
            joined_month={monthText}
            joined_year={joined_year}
            blueCheckVerified={triggeredBy.blueCheckVerified}
          >
            <Button
              variant="link"
              className="p-0"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                push(`/user/${triggeredBy.id}`);
              }}
            >
              {/* <Link href={`/user/${id}`} > */}

              <Avatar>
                <AvatarImage
                  src={triggeredBy.profilePictureUrl}
                  alt={`${triggeredBy.username} profile picture`}
                />
                <AvatarFallback>
                  <User2 />
                </AvatarFallback>
              </Avatar>
              {/* </Link> */}
            </Button>
          </HoverCardUI>
          <span className="bg-blue-500 h-5 aspect-square rounded-full absolute top-5 left-6 flex items-center justify-center">
            <LiaComments className=" text-xs " />
          </span>
        </div>
        <div className="flex-grow">
          <p className={`text-sm `}>
            <Link
              className="font-semibold hover:underline"
              href={`/user/${triggeredBy.id}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
              }}
            >
              {getUppercaseFirstLetter(triggeredBy.name)}
            </Link>{" "}
            commented on your post
          </p>
          <p className="text-xs ">
            {amount}
            {timeType}
          </p>
        </div>
      </motion.div>
    );
  }
  if (type === NotificationType.REPLY) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => push(url)}
        className={`flex items-center border-b cursor-pointer hover:bg-sidebar-accent transition-colors duration-300 ease-in py-4 px-p-half ${
            isRead ? "" : "bg-sidebar-hover"
          }`}
      >
        <div className="mr-4 gap-x-4  relative  flex items-center justify-center ">
          {/* <Heart className="h-5 w-5" /> */}

          <HoverCardUI
            profilePictureUrl={triggeredBy.profilePictureUrl}
            username={triggeredBy.username}
            bio={triggeredBy.bio}
            joined_month={monthText}
            joined_year={joined_year}
            blueCheckVerified={triggeredBy.blueCheckVerified}
          >
            <Button
              variant="link"
              className="p-0"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                push(`/user/${triggeredBy.id}`);
              }}
            >
              {/* <Link href={`/user/${id}`} > */}

              <Avatar>
                <AvatarImage
                  src={triggeredBy.profilePictureUrl}
                  alt={`${triggeredBy.username} profile picture`}
                />
                <AvatarFallback>
                  <User2 />
                </AvatarFallback>
              </Avatar>
              {/* </Link> */}
            </Button>
          </HoverCardUI>
          <span className="bg-blue-500 h-5 aspect-square rounded-full absolute top-5 left-6 flex items-center justify-center">
            <LiaComments className=" text-xs " />
          </span>
        </div>
        <div className="flex-grow">
          <p className={`text-sm `}>
            <Link
              className="font-semibold hover:underline"
              href={`/user/${triggeredBy.id}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
              }}
            >
              {getUppercaseFirstLetter(triggeredBy.name)}
            </Link>{" "}
           replied to your comment
          </p>
          <p className="text-xs ">
            {amount}
            {timeType}
          </p>
        </div>
      </motion.div>
    );
  }
  if (type === NotificationType.FOLLOW) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => push(url)}
        className={`flex items-center border-b cursor-pointer hover:bg-sidebar-accent transition-colors duration-300 ease-in py-4 px-p-half ${
            isRead ? "" : "bg-sidebar-hover"
          }`}
      >
        <div className="mr-4 gap-x-4  relative  flex items-center justify-center ">
          {/* <Heart className="h-5 w-5" /> */}

          <HoverCardUI
            profilePictureUrl={triggeredBy.profilePictureUrl}
            username={triggeredBy.username}
            bio={triggeredBy.bio}
            joined_month={monthText}
            joined_year={joined_year}
            blueCheckVerified={triggeredBy.blueCheckVerified}
          >
            <Button
              variant="link"
              className="p-0"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                push(`/user/${triggeredBy.id}`);
              }}
            >
              {/* <Link href={`/user/${id}`} > */}

              <Avatar>
                <AvatarImage
                  src={triggeredBy.profilePictureUrl}
                  alt={`${triggeredBy.username} profile picture`}
                />
                <AvatarFallback>
                  <User2 />
                </AvatarFallback>
              </Avatar>
              {/* </Link> */}
            </Button>
          </HoverCardUI>
          <span className="bg-emerald-500 h-5 aspect-square rounded-full absolute top-5 left-6 flex items-center justify-center">
            <UserPlus className=" h-[12px] w-[12px] " />
          </span>
        </div>
        <div className="flex-grow">
          <p className={`text-sm `}>
            <Link
              className="font-semibold hover:underline"
              href={`/user/${triggeredBy.id}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
              }}
            >
              {getUppercaseFirstLetter(triggeredBy.name)}
            </Link>{" "}
            started following you
          </p>
          <p className="text-xs ">
            {amount}
            {timeType}
          </p>
        </div>
      </motion.div>
    );
  }
  return <></>;

};
