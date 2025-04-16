"use client";
import { FC } from "react";
import { SessionType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User2, Mail } from "lucide-react";
import { notable } from "@/lib/fonts";
import { Button } from "../ui/button";
import { Images } from "@/components/images";
import Logo from "@/public/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const HomeNavbar: FC<{ session: SessionType }> = ({ session }) => {
  const { push } = useRouter();
  return (
    <section className="w-full gap-4 px-p-half py-2 flex sm:hidden z-40 bg-background items-center justify-between sticky top-0 left-0">
      <div className="flex items-center gap-2">
        <div className={`relative h-[30px]  aspect-square`}>
          <Images imgSrc={Logo} alt="Logo" />
        </div>
        <h2 className={`${notable.className} `}>Briza</h2>
      </div>
      <div className="flex items-center gap-4">
        <Button size="icon" variant="outline" onClick={() => push("/messages")}>
          <Mail />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage
                src={session?.profilePictureUrl || ""}
                alt="User profile picture"
              />
              <AvatarFallback>
                <User2 />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={()=> push(`/user/${session.id}`)}>
                Profile
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => push("/settings")}>
                Settings
                {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
};
