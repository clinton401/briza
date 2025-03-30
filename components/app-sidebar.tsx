"use client";
import {
  Home,
  Inbox,
  Search,
  Settings,
  ChevronUp,
  BookmarkPlus,
  PlusCircle,
  BellDot,
  // Check,
  User2,
} from "lucide-react";
import Link from "next/link";
import { getUppercaseFirstLetter } from "@/lib/random-utils";
import { FC, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Images } from "@/components/images";
import Logo from "../public/logo.png";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SessionType } from "@/lib/types";
import createToast from "@/hooks/create-toast";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreatePostUI } from "@/components/post/create-post-ui";
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: BellDot,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: Inbox,
  },
  {
    title: "Bookmarks",
    url: "/bookmarks",
    icon: BookmarkPlus,
  },
  // {
  //   title: "Compose",
  //   url: "/compose",
  //   icon: PlusCircle,
  // },

  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export const AppSidebar: FC<{
  session: SessionType | undefined;
  isLoading: boolean;
  error: Error | null;
  notificationsCount: number | undefined;
}> = ({ session, isLoading, error, notificationsCount }) => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { createError, createSimple } = createToast();
  const { open } = useSidebar();
  const dialogTriggerRef = useRef<HTMLButtonElement | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      createSimple("You have logged out successfully.");

      window.location.href = "/login";
      // router.push("/auth/login");
    } catch (error) {
      console.error(`Unable to logout: ${error}`);
      createError("There was a problem trying to logout");
    }
  };
  // console.log(session)
  const profileNavigator = () => {
    if (!session?.username) return;
    push(`/user/${encodeURIComponent(session.id)}`);
  };
  const session_username = session?.username ?? "user";
  const session_name = session?.name || "User";
  const uppercase_name = getUppercaseFirstLetter(session_name);
  const closeHandler = () => {
    if (dialogTriggerRef.current) {
      dialogTriggerRef.current.click(); 
    }
  }
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`relative h-[35px]  aspect-square`}>
              <Images imgSrc={Logo} alt="Logo" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={`${
                        pathname === item.url ? "bg-sidebar-hover" : ""
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.title === "Notifications" &&
                    !isLoading &&
                    !error &&
                    notificationsCount !== undefined &&
                    notificationsCount > 0 && (
                      <SidebarMenuBadge className="h-5 w-5  rounded-full bg-destructive flex items-center justify-center">
                        {notificationsCount}
                      </SidebarMenuBadge>
                    )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {session && (
          <SidebarGroup>
            <SidebarMenu>
              <Dialog>
                <DialogTrigger asChild >
                  <Button className="rounded-full" ref={dialogTriggerRef}> <PlusCircle className="mr-1"/> Compose</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-dvh overflow-y-auto ">
                <DialogTitle>Create a post</DialogTitle>
                  <CreatePostUI session={session} borderNeeded={false} closeHandler={closeHandler}/>
                  {/* <DialogClose /> */}
                </DialogContent>
              </Dialog>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className={` ${open ? "h-[2.5rem]" : ""} `}>
                  <Avatar className={`${open ? "h-9 w-9 " : "h-5 w-5"}`}>
                    <AvatarImage
                      src={session?.profilePictureUrl || ""}
                      alt="User profile picture"
                    />
                    <AvatarFallback>
                      <User2 />
                    </AvatarFallback>
                  </Avatar>

                  <span className="flex-grow truncate justify-center flex flex-col gap-1 text-xs">
                    <p className="w-full truncate flex item-center ">
                      {uppercase_name}
                    </p>{" "}
                    <p className="w-full truncate">@{session_username}</p>{" "}
                  </span>

                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                {session?.username && (
                  <DropdownMenuItem onClick={profileNavigator}>
                    <span>Profile</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleLogout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
