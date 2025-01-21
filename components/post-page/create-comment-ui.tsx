import { FC, Dispatch, SetStateAction, forwardRef, memo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type SessionType } from "@/lib/types";
import {
  User2,
  Loader,
  Smile,
} from "lucide-react";
import { EmojiSelector } from "@/components/emoji-selector";
import { Button } from "@/components/ui/button";

type CreateCommentProps = {
  session: SessionType;
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  isPostPending: boolean;
  handleInput: () => null | undefined;
  createComment: () => Promise<void>
};
export const CreateCommentUI = memo(
  forwardRef<HTMLTextAreaElement, CreateCommentProps>(
    ({ session, content, setContent, isPostPending, handleInput, createComment }, ref) => {
      return (
        <div className="w-full border-y relative  px-p-half flex py-4 gap-4  ">
          <Avatar>
            <AvatarImage
              src={session.profilePictureUrl}
              alt="User profile picture"
            />
            <AvatarFallback>
              <User2 />
            </AvatarFallback>
          </Avatar>
          <div className="grow  relative flex flex-col gap-4  ">
            <Textarea
              placeholder="Post your reply"
              spellCheck={false}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-[40px] w-full min-h-[40px] rounded-none max-h-[200px] border-x-0 border-t-0 border-b-2 focus-visible:outline-0 focus:border-primary  pr-6 resize-none overflow-hidden"
              ref={ref}
              disabled={isPostPending}
              onInput={handleInput}
            />
            <EmojiSelector
              content={content}
              setContent={setContent}
              ref={ref}
            >
              {/* <TooltipComp text="Add an emoji"> */}
              <Button
                className="bg-transparent h-8 w-8 absolute top-0 flex items-center justify-center right-1 text-foreground rounded-full "
                disabled={isPostPending}
              >
                <Smile className="text-sm h-4 aspect-square" />
              </Button>
              {/* </TooltipComp> */}
            </EmojiSelector>

            <div className="flex items-center gap-2 flex-wrap justify-between">
              <span className="flex  items-center gap-2 flex-wrap"></span>
              <span className="flex gap-2 items-center ">
                <Button
                  className="rounded-full"
                  disabled={content.length < 1 || isPostPending}
                  onClick={createComment}
                >
                  {isPostPending ? (
                    <Loader className=" h-4 w-4 animate-spin" />
                  ) : (
                    "Post"
                  )}
                </Button>
              </span>
            </div>
          </div>
        </div>
      );
    }
  )
);
