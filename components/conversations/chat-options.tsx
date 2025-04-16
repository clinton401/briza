"use client";
import { FC, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Trash2, User2, Loader } from "lucide-react";
import { ConversationType } from "@/lib/types";
import { ConvoAlertDialog } from "@/components/conversations/convo-alert-dialog";
import { updateConversation } from "@/actions/update-conversation";
import createToast from "@/hooks/create-toast";
import { unknown_error } from "@/lib/variables";
import {useQueryClient} from "@tanstack/react-query"; 
import {useRouter} from "next/navigation";
export const ChatOptions: FC<{ conversation: ConversationType }> = ({
  conversation,
}) => {
  const [isPending, setIsPending] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { createSimple, createError } = createToast();
  const queryClient = useQueryClient();
  const {replace} = useRouter();
  const conversationHandler = async (
    type: "isBlocked" | "isDeleted",
    value: boolean
  ) => {
    if (isPending) {
      createError("Please wait for the previous action to complete");
      return;
    }
    try {
      setIsPending(true);
      const error_response = await updateConversation(
        conversation.id,
        type,
        value
      );
      if (error_response) {
        createError(error_response);
        return;
      }
      createSimple(
        type === "isBlocked"
          ? `User ${conversation.user.username} ${
              conversation.isBlocked ? "unblocked" : "blocked"
            }`
          : `Conversation deleted`
      );
      if(type === "isBlocked"){
        queryClient.setQueryData(["conversations"], (old: {pageParams: number[],pages: {data: ConversationType[]}[]}| null) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((convo: ConversationType) =>
                convo?.id === conversation.id
                  ? {
                    ...convo,
                    [type]: value
                  }
                  : convo
              ),
            })),
          };
        });
        queryClient.setQueryData(["conversation", conversation.id], (old: ConversationType) => {
          if (!old) return;
          return {
            ...old,
           [type]: value
          }
        })
      } else {
        queryClient.setQueryData(["conversations"], (old: {pageParams: number[],pages: {data: ConversationType[]}[]}| null) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((convo: ConversationType) => convo?.id !== conversation.id),
            })),
          };
        });
        queryClient.setQueryData(["conversation", conversation.id], (old: ConversationType) => {
          if (!old) return;
          return {
            ...old,
            isDeleted: true
          }
        })
        replace("/messages");
        
      }
    } catch (error) {
      console.error(`Unable to update conversation: ${error}`);
      createError(unknown_error);
    }finally {
      setIsPending(false);
    }
  };
  // const deleteConversation = async () => {
  //   dropdownTriggerRef.current?.click();
  // };
  return (
    <>
      {isPending ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              ref={dropdownTriggerRef}
              variant="outline"
              size="icon"
              className="rounded-full items-center flex justify-center border-none"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60"
            // onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <ConvoAlertDialog
              title={`${conversation.isBlocked ? "Unblock" : "Block"} @${conversation.user.username || "user"}`}
              description={conversation.isBlocked ? "Unblock this user to see their messages" : "Block this user to stop seeing their messages"}
              buttonText={conversation.isBlocked ? "Unblock" : "Block"}


              // username={conversation.user.username || "user"}
              confirmHandler={() => conversationHandler("isBlocked", !conversation.isBlocked)}
            >
              <DropdownMenuItem
                className="flex cursor-pointer items-center truncate"
                onSelect={(e) => e.preventDefault()}
              >
                <User2 className="mr-1" />
                {conversation.isBlocked ? "Unblock" : "Block"}{" "}
                {conversation.user.username
                  ? `@${conversation.user.username}`
                  : "User"}
              </DropdownMenuItem>
            </ConvoAlertDialog>
            <ConvoAlertDialog
              title="Delete Conversation?"
              description="This action cannot be undone. This will permanently delete the conversation."
              // username={conversation.user.username || "user"}
              buttonText={"Delete"}
              confirmHandler={() => conversationHandler("isDeleted", true)}
            >
              <DropdownMenuItem
                className="flex cursor-pointer items-center text-destructive truncate"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="mr-1" />
                Delete conversation
              </DropdownMenuItem>
            </ConvoAlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};
