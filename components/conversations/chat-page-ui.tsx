"use client";
import { FC, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User2,
  Check,
  Send,
  Smile,
  ArrowBigDownDash,
  Loader
} from "lucide-react";
import { QueryFunctionContext, useQueryClient } from "@tanstack/react-query";
import fetchData from "@/hooks/fetch-data";
import { ConversationType, MessageType, SessionType } from "@/lib/types";
import { unknown_error } from "@/lib/variables";
import PostLoadingPage from "@/app/status/[id]/loading";
import { ErrorComp } from "@/components/error-comp";
import { v4 as uuidv4 } from 'uuid';
import { HoverCardUI } from "@/components/hover-card-ui";
import { dateHandler, getUppercaseFirstLetter } from "@/lib/random-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ChatOptions } from "@/components/conversations/chat-options";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { removeDuplicates } from "@/lib/random-utils";
import { MessageCard } from "@/components/conversations/message-card";
import handleTextAreaHeight from "@/hooks/handle-text-area-height";
import { Textarea } from "../ui/textarea";
import useSendMessage from "@/hooks/use-send-message";

import { useInView } from "react-intersection-observer";
import createToast from "@/hooks/create-toast";
import { EmojiSelector } from "@/components/emoji-selector";
import { markConvoAsRead } from "@/actions/mark-convo-as-read";
// import { Virtuoso } from 'react-virtuoso';
type FetchMessagesResult = {
  data: MessageType[];
  nextPage?: number;
};

type ConvoQueryKey = ["conversation", string];

const fetchConvo = async ({
  queryKey,
  signal,
}: QueryFunctionContext<ConvoQueryKey>): Promise<ConversationType> => {
  const [, convoId] = queryKey;
  const response = await fetch(`/api/conversations/${convoId}`, { signal });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();

  return data;
};

export const ChatPageUI: FC<{ id: string; session: SessionType }> = ({
  id,
  session,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
// const [preserveScroll, setPreserveScroll] = useState(false);
// const [prevScrollHeight, setPrevScrollHeight] = useState(0);
const [shouldPreserveScroll, setShouldPreserveScroll] = useState(false);

  const {
    data: conversation,
    error,
    isLoading,
    refetch,
  } = fetchData<ConversationType, ConvoQueryKey>(
    ["conversation", id],
    fetchConvo,
    {
      enabled: !!id,
    }
  );
  const fetchMessages = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }): Promise<FetchMessagesResult> => {
    const response = await fetch(
      `/api/conversations/${id}/messages?page=${pageParam}`,
      {
        signal,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || unknown_error);
    }
    const data = await response.json();
    return {
      data: data.messages,
      nextPage: data.nextPage,
    };
  };
  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isMessagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useInfiniteScroll<MessageType, FetchMessagesResult>(
    ({ pageParam = 1, signal }) => fetchMessages({ pageParam, signal }),
    ["messages", id]
  );
  const { push } = useRouter();
  const containerRef = useRef<HTMLElement | null>(null);
const bottomRef = useRef<HTMLDivElement>(null);
const anchorElementRef = useRef<HTMLDivElement>(null);
const { ref, inView } = useInView();
  const { ref: intersectionRef, inView: isBottomRefInView } = useInView();
  const { textareaRef, handleInput } = handleTextAreaHeight();
  const { mutate: sendMessage } = useSendMessage();
  const { createError } = createToast();
  const queryClient = useQueryClient();
   const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
    
      setHasScrolledToBottom(true);
      }, 1000)
  };
const markAsRead = async() => {
  queryClient.setQueryData(["conversations"], (old: {pageParams: number[],pages: {data: ConversationType[]}[]}| null) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: page.data.map((convo: ConversationType) =>
          convo?.id === id
            ? {
              ...convo,
              
              isRead: true
            }
            : convo
        ),
      })),
    };
  });
  queryClient.setQueryData(["conversation", id], (old: ConversationType) => {
    if (!old) return;
    return {
      ...old,
      isRead: true
    }
  })
  try{
const error_response = await markConvoAsRead(id);
if(error_response){
  throw new Error (error_response)
}
  }catch(error){
    console.error(`Unable to mark conversation as read: ${error}`)
  }
}

useEffect(() => {
  if( conversation && !conversation.isRead && !isLoading && !isMessagesLoading && !error && !messagesError) {
    markAsRead()
  }
}, [conversation, id, isLoading, isMessagesLoading, error, messagesError])
  useEffect(() => {
    setIsAtBottom(!isBottomRefInView);
  }, [isBottomRefInView]);
  useEffect(() => {
    if (!isLoading && !isMessagesLoading && !error && !messagesError) {
        intersectionRef(bottomRef.current);
      scrollToBottom();
    }
  }, [isLoading, isMessagesLoading, error, messagesError]);
 
  
  useEffect(() => {
    if (
      inView &&
      hasScrolledToBottom &&
      !isFetchingNextPage &&
      hasNextPage &&
      containerRef.current
    ) {
  
      if (uniqueMessages.length > 0) {
        setShouldPreserveScroll(true);
        fetchNextPage();
      }
    }
  }, [inView, hasScrolledToBottom, isFetchingNextPage, hasNextPage]);
  
  useEffect(() => {
    if (shouldPreserveScroll && !isFetchingNextPage && anchorElementRef.current) {
  
      anchorElementRef.current.scrollIntoView();
      setShouldPreserveScroll(false);
    }
  }, [isFetchingNextPage, shouldPreserveScroll]);
  
  
  const backHandler = () => {
    push("/messages");
  };
// console.log({isFetchingNextPage, inView, ref: containerRef.current, hasScrolledToBottom, hasNextPage})
//   console.log({
//     isBottomRefInView
//   });
//   console.log({
//     isLoading,
//     error,
//     conversation,
//     messages,
//     messagesError,
//     isMessagesLoading,
//   });
  if (isLoading || isMessagesLoading) {
    return <PostLoadingPage />;
  }
  if (error || !conversation || messagesError || !messages) {
    const errorMessage =
      error?.message || messagesError?.message || unknown_error;
    const refetchFunc = () => {
      refetch();
      refetchMessages();
    };
    return <ErrorComp message={errorMessage} refetch={refetchFunc} />;
  }

  const user = conversation.user;
  const joined_date = new Date(user.createdAt);
  const { year: joined_year, monthText } = dateHandler(joined_date);
  const uppercase_name = getUppercaseFirstLetter(user.name);
  const uniqueMessages = removeDuplicates(messages);

  const handleMessageSending = () => {
    if (newMessage.trim().length < 1) return;
    const date = new Date()
    const newData: MessageType = {
      content: newMessage,
      conversationId: conversation.id,
      id: uuidv4(),
      senderId: session.id,
      receiverId: user.id,
      createdAt: date,
      updatedAt: date,
      isRead: true

    }
    queryClient.setQueryData(["messages", conversation.id], (old: {pageParams: number[],pages: {data: MessageType[]}[]}| null) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page, index) => {

          if (index === 0) {
            return { ...page, data: [newData, ...page.data] };
          }
          return page;
        }),
      };
    })
    sendMessage(
      {
        convoId: conversation.id,
        message: newMessage,
        receiverId: user.id,
        senderId: session.id,
      },
      {
        onError: (error) => {
          console.error("Error sending message:", error);
          createError(error?.message || `Unable to  send message `);
        },
      }
    );
    setNewMessage("");
    if(textareaRef && textareaRef.current){
    textareaRef.current.style.height = "40px"
    }
    textareaRef.current?.focus();
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };
 

  return (
    <main className="w-full pb-16  min-h-dvh flex flex-col " >
      <section className="flex justify-between gap-x-2 gap-y-4  border border-b z-50 sticky flex-wrap bg-background top-0 left-0  w-full items-center">
        <div className="w-full flex items-center py-3 justify-between flex-wrap gap-x-2 gap-y-4 px-p-half ">
          <div className="grow flex items-center  flex-wrap gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full items-center  flex  justify-center  border-none"
              onClick={backHandler}
            >
              <ArrowLeft className="" />
            </Button>
            <HoverCardUI
              blueCheckVerified={user.blueCheckVerified}
              profilePictureUrl={user.profilePictureUrl || ""}
              username={user.username || "user"}
              bio={user.bio || ""}
              joined_month={monthText}
              joined_year={joined_year}
            >
              <Button
                variant="link"
                className="p-0"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();

                  push(`/user/${user.id}`);
                }}
              >
                {/* <Link href={`/user/${id}`} > */}

                <Avatar>
                  <AvatarImage
                    src={user.profilePictureUrl || ""}
                    alt={`${user.username} profile picture`}
                  />
                  <AvatarFallback>
                    <User2 />
                  </AvatarFallback>
                </Avatar>
                {/* </Link> */}
              </Button>
            </HoverCardUI>
            <span className=" h-full w-[150px]   overflow-hidden  justify-center flex flex-col gap-1 text-xs">
              {/* <span className=" flex w-full truncate items-center"> */}
              <Link
                href={`/user/${user.id}`}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  e.stopPropagation()
                }
                className="  w-full hover:underline truncate   flex items-center"
              >
                {uppercase_name}

                {user.blueCheckVerified && (
                  <span className="h-3 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                    <Check className="h-2 w-2" />
                  </span>
                )}
              </Link>
              {/* </span> */}
              {/* <span className=" flex truncate w-full items-center"> */}
              <Link
                href={`/user/${user.id}`}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  e.stopPropagation()
                }
                className="  w-full hover:underline truncate  text-muted-foreground"
              >
                @{user.username}
              </Link>
              {/* </span> */}
            </span>
          </div>
          <ChatOptions conversation={conversation} />
        </div>
      </section>
      
      <section ref={ref} className=""></section>
      {isFetchingNextPage && (
        <section className="w-full  overflow-hidden flex items-center justify-center pt-4 ">
          <Loader className="h-4 w-4 animate-spin" />
        </section>
      )}
      <section className="flex-1 flex  px-p-half flex-col gap-3 pt-4" ref={containerRef}>
        {uniqueMessages.length < 1 && (
          <div className="w-full flex-1 px-p-half flex items-center justify-center  ">
            <p className=" text-center text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
        {uniqueMessages.length > 0 && (
          < >
             {[...uniqueMessages].reverse().map((message, index) => {
              if (index === 9) {
                return (
                  <div ref={anchorElementRef} key={message.id}>
                    <MessageCard
                      message={message}
                      userId={session.id}
                    />
                  </div>
                );
              }
              
              return (
                <MessageCard
                  message={message}
                  userId={session.id}
                  key={message.id}
                />
              );
            })}

{/* <Virtuoso
        data={[...uniqueMessages].reverse()}
        firstItemIndex={0}
        className="flex-1"
        // style={{ height: '100%', minHeight: '300px' }}
        initialTopMostItemIndex={uniqueMessages.length - 1} 
        startReached={() => {
          console.log("Start reached")
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        itemContent={(index, message) => (
          <MessageCard message={message} userId={session.id}
          key={message.id}/>
        )}
      /> */}
          </>
        )}
      </section>
      <div ref={bottomRef} />
      {isAtBottom && (
        <Button
          size="icon"
          variant="outline"
          className="fixed bottom-[100px] z-20 right-p-half"
          onClick={scrollToBottom}
        >
          <ArrowBigDownDash className="h-4 w-4" />
        </Button>
      )}
      <section className="fixed bottom-0 bg-background py-2 px-p-half right-0 chat_input_section ">
        {conversation.isBlocked && (
          <p className="w-full text-center text-sm">
            You’ve blocked this user. You can’t send or receive messages until
            you unblock them.
          </p>
        )}
        {!conversation.isBlocked && conversation.blockedByOtherUser && (
          <p className="w-full text-center text-sm">
            You can’t send messages to this user. They’ve blocked you.
          </p>
        )}
        {!conversation.isBlocked && !conversation.blockedByOtherUser && (
          <div className="w-full relative  ">
             <EmojiSelector
              content={newMessage}
              setContent={setNewMessage}
              ref={textareaRef}
            >
              {/* <TooltipComp text="Add an emoji"> */}
              <Button
                variant="outline"
                size="icon"
                className="h-[40px] aspect-square  top-0 absolute rounded-none rounded-tl-md rounded-bl-md left-0 text-foreground "
                // disabled={isPostPending}
              >
                <Smile className="text-sm h-4 aspect-square text-gray-300" />
              </Button>
              {/* </TooltipComp> */}
            </EmojiSelector>

            <Textarea
              value={newMessage}
              placeholder="Send message"
              onChange={(e) => setNewMessage(e.target.value)}
              spellCheck={false}
              ref={textareaRef}
              onInput={handleInput}
              className="w-full pl-[40px] pr-[40px] h-[40px] min-h-[40px] max-h-[100px] bg-background resize-none overflow-hidden  placeholder:italic italic "
            />

           
            {/* <Smile className="absolute left-3 h-4 w-4  top-1/2 translate-y-[-50%]  text-gray-300 " /> */}
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 h-[40px] aspect-square top-0 rounded-none rounded-tr-md rounded-br-md text-gray-300 "
              disabled={newMessage.trim().length < 1}
              onClick={handleMessageSending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </main>
  );
};
