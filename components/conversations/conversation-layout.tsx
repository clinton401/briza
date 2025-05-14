"use client";
import { FC, useEffect, useState, useRef } from "react";
import { notable } from "@/lib/fonts";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import {
  MailPlus,
  Loader,
  MessageCircle,
  Search,
  ArrowLeft,
  X
} from "lucide-react";
import { NewConvoDialog } from "@/components/conversations/new-convo-dialog";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { unknown_error } from "@/lib/variables";
import { ConversationType } from "@/lib/types";
import { removeDuplicates } from "@/lib/random-utils";
import { ConvoCard } from "./convo-card";
import { Input } from "@/components/ui/input";
import { ConvoSearch } from "./convo-search";
import PostLoadingPage from "@/app/status/[id]/loading";
import { ErrorComp } from "@/components/error-comp";
type FetchConversationsResult = {
  data: ConversationType[];
  nextPage?: number;
};

const fetchConversations = async ({
  pageParam = 1,
  signal,
}: {
  pageParam?: number;
  signal?: AbortSignal;
}): Promise<FetchConversationsResult> => {
  const response = await fetch(`/api/conversations?page=${pageParam}`, {
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();
  return {
    data: data.conversations,
    nextPage: data.nextPage,
  };
};

export const ConversationLayout: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteScroll<ConversationType, FetchConversationsResult>(
    ({ pageParam = 1, signal }) => fetchConversations({ pageParam, signal }),
    ["conversations"]
  );

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage]);

  if (isLoading)
    return (
      <PostLoadingPage/>
    );
  if (error || !data) {
    const errorMessage = error?.message || unknown_error;
    return (
      <ErrorComp message={errorMessage} refetch={refetch}/>
    );
  }
  const conversations = removeDuplicates(data).sort((a, b) => {
    const aDate = new Date(a.lastMessageAt ?? a.updatedAt);
    const bDate = new Date(b.lastMessageAt ?? b.updatedAt);
  
    return bDate.getTime() - aDate.getTime(); 
  });
  
  return (
    <div className="w-full pb-16 md:pb-8 ">
      <section className="flex justify-between gap-x-2 gap-y-4 px-p-half border border-b z-50 sticky flex-wrap bg-background top-0 left-0  w-full items-center py-2">
        <div className="flex items-center gap-4 justify-between w-full flex-wrap">
          <h2 className={`font-bold text-lg ${notable.className}`}>Messages</h2>
          <NewConvoDialog>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full items-center justify-center border-none"
              // onClick={backHandler}
            >
              <MailPlus />
            </Button>
          </NewConvoDialog>
        </div>
        <div className="flex items-center gap-2 w-full">
          {isFocused && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full items-center  flex  justify-center  border-none"
              onClick={() => {
                setIsFocused(false);
                setInputValue("");
                inputRef.current?.blur();
              }}
            >
              <ArrowLeft className="" />
            </Button>
          )}
          <div className="  grow  relative ">
            <Input
              value={inputValue}
              placeholder="Search messages"
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              // onBlur={() => setIsFocused(false)}
              ref={inputRef}
              className="w-full pl-[40px] pr-[50px]  placeholder:italic italic rounded-full"
            />

            <Search className="absolute left-3 h-4 w-4  top-1/2 translate-y-[-50%]  text-gray-300 " />
           {inputValue.length > 0 && ( <Button
              variant="outline"
              size="icon"
              className="absolute right-0 h-full aspect-square top-1/2 translate-y-[-50%] rounded-tr-full rounded-br-full  text-gray-300 "
              onClick={() => {
                  setInputValue("");
              
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>)}
          </div>
        </div>
      </section>
      {!isFocused && (<>
        {conversations.length < 1 && (
        <section className="flex flex-col items-center justify-center grow min-h-[80dvh] text-center px-4">
          <MessageCircle className="w-12 h-12 " />
          <h2 className={`mt-4 text-xl font-semibold ${notable.className}`}>
            No Conversations Yet
          </h2>
          <p className="mt-2 ">Start a conversation by messaging someone.</p>
        </section>
      )}
      {conversations.length > 0 && (
        <section className="flex w-full flex-col ">
          {conversations.map((conversation) => {
            return (
              <ConvoCard key={conversation.id} conversation={conversation} />
            );
          })}
        </section>
      )}
      {isFetchingNextPage && (
        <div className="w-full  overflow-hidden flex items-center justify-center py-8 ">
          <Loader className="h-4 w-4 animate-spin" />
        </div>
      )}
      <section ref={ref} className=""></section>
      </>)}
      {isFocused && (
        <ConvoSearch inputValue={inputValue}/>
      )}

    </div>
  );
};
