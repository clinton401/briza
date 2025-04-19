"use client";
import { FC, useState } from "react";
import { SessionType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User2, Mail, Trash2, Loader } from "lucide-react";
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
import createToast from "@/hooks/create-toast";
import { signOut } from "next-auth/react";
import { ConvoAlertDialog } from "@/components/conversations/convo-alert-dialog";
import { deleteUserAccount } from "@/actions/delete-user-account";

export const HomeNavbar: FC<{ session: SessionType }> = ({ session }) => {
  const [isLogoutPending, setIsLogoutPending] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const { push } = useRouter();
  const { createError, createSimple } = createToast();
  const handleLogout = async () => {
    try {
      setIsLogoutPending(true);
      await signOut();
      createSimple("You have logged out successfully.");

      window.location.href = "/login";
      // router.push("/auth/login");
    } catch (error) {
      console.error(`Unable to logout: ${error}`);
      createError("There was a problem trying to logout");
    } finally {
      setIsLogoutPending(false);
    }
  };
  const handleDeletion = async () => {
    try {
      setIsDeletePending(true);
      const data = await deleteUserAccount();
      const { success, message } = data;
      if (!success) {
        return createError(message);
      }
      await signOut();
      createSimple(message);
      window.location.href = "/login";
    } catch (error) {
      console.error(`Unable to delete account: ${error}`);
     createError("There was a problem trying to delete account")
    } finally {
      setIsDeletePending(false);
    }
  };
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
              <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => push(`/user/${session.id}`)} >
                Profile
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>

              <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => push("/settings")}>
                Settings
                {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
              </DropdownMenuItem>
              <DropdownMenuItem
className="cursor-pointer"

                onClick={handleLogout}
                disabled={isLogoutPending || isDeletePending}
              >
                Logout
                {isLogoutPending && <Loader className="ml-2  animate-spin " />}
              </DropdownMenuItem>
              <ConvoAlertDialog
                title="Are you absolutely sure?"
                description=" This action cannot be undone. This will  permanently delete your
              account and remove your data from our servers."
                // username={conversation.user.username || "user"}
                buttonText={"Delete"}
                confirmHandler={handleDeletion}
              >
                <DropdownMenuItem
                  className="flex cursor-pointer items-center text-destructive cursor truncate"
                  onSelect={(e) => e.preventDefault()}
                  disabled={isDeletePending || isLogoutPending}
                >
                  <Trash2 className="mr-1" />
                  Delete account
                  {isDeletePending && <Loader className="ml-2  animate-spin " />}
                </DropdownMenuItem>
              </ConvoAlertDialog>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
};
