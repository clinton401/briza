import { FC } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { RiHome2Fill, RiSearchLine, RiSearch2Fill } from "react-icons/ri";
import { IoMdNotificationsOutline, IoMdNotifications } from "react-icons/io";
import { CiSquarePlus } from "react-icons/ci";
import { FaSquarePlus } from "react-icons/fa6";
import type { SessionType } from "@/lib/types";
import { User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const MobileNavbar:FC<{ session: SessionType | undefined,
  isLoading: boolean;
  error: Error | null;
  notificationsCount: number | undefined
 }> = ({
  session,
  isLoading, error, notificationsCount
}) => {
  if (!session) return;
  const pathname = usePathname();

  const links = [
    {
      title: "Home",
      url: "/",
      not_active: AiOutlineHome,
      active: RiHome2Fill,
    },
    {
      title: "Search",
      url: "/search",
      not_active: RiSearchLine,
      active: RiSearch2Fill,
    },

    // {
    //   title: "Inbox",
    //   url: "/messages",
    //   icon: Inbox,
    // },
    // {
    //   title: "Bookmarks",
    //   url: "/bookmarks",
    //   icon: BookmarkPlus,
    // },
    {
      title: "Compose",
      url: "/compose",
      not_active: CiSquarePlus,
      active: FaSquarePlus,
    },
    {
      title: "Notifications",
      url: "/notifications",
      not_active: IoMdNotificationsOutline,
      active: IoMdNotifications,
    },

    // {
    //   title: "Profile",
    //   url: `/user/${session.id}`,
    //   active: (
    //     <Avatar className={``}>
    //       <AvatarImage
    //         src={session.profilePictureUrl || ""}
    //         alt="User profile picture"
    //       />
    //       <AvatarFallback>
    //         <User2 />
    //       </AvatarFallback>
    //     </Avatar>
    //   ),
    //   not_active: (
    //     <Avatar className={``}>
    //       <AvatarImage
    //         src={session.profilePictureUrl || ""}
    //         alt="User profile picture"
    //       />
    //       <AvatarFallback>
    //         <User2 />
    //       </AvatarFallback>
    //     </Avatar>
    //   ),
    // },
  ];
  return (
    <aside className="fixed bottom w-full left-0 bottom-0 py-4 bg-background border">
      <ul className="w-full flex items-center justify-evenly ">
        {links.map((link) => {
          return (
            <li key={link.title} className="relative">
              {" "}
              <Link href={link.url} className="text-2xl">
                {pathname === link.url ? <link.active /> : <link.not_active />}
              </Link>
              {
                link.title === "Notifications" &&
                    !isLoading &&
                    !error &&
                    notificationsCount !== undefined && 
                    notificationsCount > 0 && (
                      <p className="h-5 w-5 absolute bottom-[60%] left-[50%] rounded-full bg-destructive flex items-center justify-center">{notificationsCount}</p>
                    )}
            </li>
          );
        })}
        <li>
          <Link href={`/user/${session.id}`}>
            <Avatar className={`h-6 w-6`}>
              <AvatarImage
                src={session.profilePictureUrl || ""}
                alt="User profile picture"
              />
              <AvatarFallback>
                <User2 className="h-4 w-4"/>
              </AvatarFallback>
            </Avatar>
          </Link>
        </li>
      </ul>
    </aside>
  );
};
