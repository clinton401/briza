"use client";
import { FC, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const ConvoAlertDialog: FC<{
  buttonText: string;
  confirmHandler: () => void;
  title: string;
  description: string;
  children: ReactNode
}> = ({  confirmHandler, title, children, description, buttonText }) => {
  // const isBlock = type === "block";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {/* {isBlock ? `Block @${username}?` : "Delete Conversation?"} */}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {/* {isBlock
              ? `Are you sure you want to block @${username}? They will no longer be able to message you.`
              : "This action cannot be undone. This will permanently delete the conversation."} */}
              {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmHandler}>
          {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
