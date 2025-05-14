import {

  Dispatch,
  SetStateAction,
  ReactNode,
  forwardRef,
  RefObject,
  memo
} from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";

type EmojiSelectorProps = {
  setContent: Dispatch<SetStateAction<string>>;
  children: ReactNode;
  content: string;
};
type EmojiData = {
  emoji: string;
};
export const EmojiSelector = memo(forwardRef<
  HTMLTextAreaElement,
  EmojiSelectorProps
>(({ children, setContent, content }, ref) => {
    const handleEmojiClick = (emojiData: EmojiData) => {
        if (!ref || !(ref as RefObject<HTMLTextAreaElement>).current) return;
      
        const textareaRef = ref as RefObject<HTMLTextAreaElement>;
        const { emoji } = emojiData;
      
       if(!textareaRef || !textareaRef?.current) return;
        const cursorPosition = textareaRef.current.selectionStart || 0;
        const textBeforeCursor = content.substring(0, cursorPosition);
        const textAfterCursor = content.substring(cursorPosition);
      
        // Only update state if the content actually changes
        const newContent = `${textBeforeCursor}${emoji}${textAfterCursor}`;
        if (newContent !== content) {
          setContent(newContent);
        }
      };
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 border-none z-[6000] bg-transparent" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
      <div
          className="bg-background w-full"
          id="emoji_picker"
        >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      </PopoverContent>
  
    </Popover>
  );
}));
