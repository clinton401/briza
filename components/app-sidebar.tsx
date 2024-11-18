"use client";
import {
  Home,
  Inbox,
  Search,
  Settings,
  ChevronUp,
  BookmarkPlus,
  PlusCircle,
  User2,
} from "lucide-react";
import Link from "next/link";
import { FC } from "react";
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
    title: "Inbox",
    url: "/messages",
    icon: Inbox,
  },
  {
    title: "Bookmarks",
    url: "/bookmarks",
    icon: BookmarkPlus,
  },
  {
    title: "Compose",
    url: "/compose",
    icon: PlusCircle,
  },

  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export const AppSidebar: FC<{ session: SessionType | undefined }> = ({
  session,
}) => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { createError, createSimple } = createToast();
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
  const profileNavigator = () => {
if(!session?.username)return;
push(`/user/${encodeURIComponent(session.username)}`)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="relative h-[35px] aspect-square">
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-[3rem]">
                  <Avatar>
                    <AvatarImage
                      src={session?.profilePictureUrl || ""}
                      alt="@shadcn"
                    />
                    <AvatarFallback>
                      <User2 />
                    </AvatarFallback>
                  </Avatar>

                  <span className="flex-grow truncate flex flex-col gap-1 text-xs">
                    <p className="w-full truncate">{session?.name || "User"}</p>{" "}
                    <p className="w-full truncate">{session?.email || ""}</p>{" "}
                  </span>

                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                {session?.username && (
                  <DropdownMenuItem
                    onClick={profileNavigator}
                  >
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
