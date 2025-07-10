import { FC, useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { unknown_error } from "@/lib/variables";
import {
  removeDuplicates,
  dateHandler,
  getUppercaseFirstLetter,
  timeAgoNumber,
} from "@/lib/random-utils";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { useInView } from "react-intersection-observer";
import { notable } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Loader, User2, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {useRouter} from "next/navigation";
export interface ConversationUser {
  id: string;
  name: string;
  username: string;
  blueCheckVerified: boolean;
  profilePictureUrl: string | null;
}

export interface PeopleSearchResult {
  id: string;
  user: ConversationUser;
}

export interface MessageSearchResult {
  id: string;
  content: string;
  conversationId: string;
  createdAt: Date;
  user: ConversationUser;
}

type SearchConvoResult = {
  data: (MessageSearchResult | PeopleSearchResult)[];
  nextPage?: number;
};
export const ConvoSearch: FC<{ inputValue: string }> = ({ inputValue }) => {
  const [filter, setFilter] = useState<"MESSAGE" | "PEOPLE">("PEOPLE");
  const [debouncedSearch] = useDebounce(inputValue, 500);
  const fetchConvos = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }): Promise<SearchConvoResult> => {
    const response = await fetch(
      `/api/conversations/search?page=${pageParam}&filter=${filter}&query=${encodeURIComponent(
        debouncedSearch
      )}`,
      { signal }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || unknown_error);
    }
    const data = await response.json();
    if (filter === "PEOPLE") {
      return {
        data: data.conversations,
        nextPage: data.nextPage,
      };
    } else {
      return {
        data: data.messages,
        nextPage: data.nextPage,
      };
    }
  };
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteScroll<
    PeopleSearchResult | MessageSearchResult,
    SearchConvoResult
  >(
    ({ pageParam = 1, signal }) => fetchConvos({ pageParam, signal }),
    ["convo-search", debouncedSearch.toLowerCase(), filter.toLowerCase()],
    {
      enabled: debouncedSearch.length > 0,
    }
  );
  const {push} = useRouter();
  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage]);

  const uniqueData = removeDuplicates(data);
  return (
    <section className="w-full ">
      {debouncedSearch.length < 1 && (
        <p className="pt-4 w-full text-center px-p-half">
          Try searching for people or messages
        </p>
      )}
      {debouncedSearch.length > 0 && (
        <>
          <div className="w-full flex items-center  *:grow  *:rounded-none flex-wrap  *:py-6 justify-center ">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setFilter("PEOPLE");
              }}
              className={`${filter === "PEOPLE" ? "bg-secondary" : ""}`}
            >
              People
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setFilter("MESSAGE");
              }}
              className={`${filter === "MESSAGE" ? "bg-secondary" : ""}`}
            >
              Messages
            </Button>
          </div>
          {isLoading && (
            <div className="w-full flex items-center justify-center px-p-half py-6 ">
              <Loader className=" h-6 w-6 animate-spin" />
            </div>
          )}
          {!isLoading && (error || !uniqueData) && (
            <div className="w-full flex items-center flex-col pt-6  px-p-half gap-4">
              <h2
                className={`${notable.className} w-full text-center font-bold`}
              >
                {error?.message || unknown_error}
              </h2>
              <Button onClick={refetch}>Retry</Button>
            </div>
          )}
          {!isLoading && !error && uniqueData && (
            <>
              {uniqueData.length < 1 && (
                <div className="w-full px-p-half py-6 fex flex-col">
                  <h3 className="text-xl text-center font-bold ">
                    {filter === "PEOPLE"
                      ? "No people found"
                      : "No messages found"}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {filter === "PEOPLE"
                      ? "Try searching for a different name or username."
                      : "No messages match your search query. Try a different keyword."}
                  </p>
                </div>
              )}
              {uniqueData.length > 0 && (
                <>
                  {filter === "PEOPLE" && (
                    <>
                      {(uniqueData as PeopleSearchResult[]).map((result) => {
                        const uppercaseName = getUppercaseFirstLetter(
                          result.user.name
                        );
                        return (
                          <Button
                            className="w-full flex justify-between items-center rounded-none border-none h-auto px-p-half gap-4"
                            variant="outline"
                            key={result.id}
                            onClick={() => push(`/messages/${result.id}`)}
                          >
                            <div className="grow flex items-center gap-2">
                              <Avatar className="">
                                <AvatarImage
                                  src={result.user?.profilePictureUrl || ""}
                                  alt="User profile picture"
                                />
                                <AvatarFallback>
                                  <User2 />
                                </AvatarFallback>
                              </Avatar>
                              <div className=" flex grow items-start flex-col overflow-hidden  justify-center gap-1">
                                <p className="truncate text-left  flex items-center  w-full">
                                  {uppercaseName}
                                  {result.user.blueCheckVerified && (
                                    <span className="h-4 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                                      <Check className="h-1 w-1" />
                                    </span>
                                  )}
                                </p>
                                <p className="text-muted-foreground  truncate text-left w-full">
                                  @{result.user.username}
                                </p>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </>
                  )}
                  {filter === "MESSAGE" && (
                    <>
                      {(uniqueData as MessageSearchResult[]).map((result) => {
                        if (!result.createdAt) return null;
                        const convoDate = new Date(result.createdAt);
                        const { amount, type } = timeAgoNumber(convoDate);
                        const { monthText: convoMonth, dayOfMonth: convoDay } =
                          dateHandler(convoDate);
                        const uppercaseName = getUppercaseFirstLetter(
                          result.user.name
                        );
                        return (
                          <Button
                            className="w-full flex justify-between items-center rounded-none border-none h-auto px-p-half gap-4"
                            variant="outline"
                            key={result.id}
                            onClick={() => push(`/messages/${result.conversationId}`)}
                          >
                            <div className="grow flex items-center gap-2">
                              <Avatar className="">
                                <AvatarImage
                                  src={result.user?.profilePictureUrl || ""}
                                  alt="User profile picture"
                                />
                                <AvatarFallback>
                                  <User2 />
                                </AvatarFallback>
                              </Avatar>
                              <div className=" flex grow items-start flex-col overflow-hidden  justify-center gap-1">
                                <p className="truncate text-left  flex items-center  w-full">
                                  {uppercaseName}
                                  {result.user.blueCheckVerified && (
                                    <span className="size-4 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                                      <Check className="h-1 w-1" />
                                    </span>
                                  )}
                                </p>
                                <p className="text-muted-foreground  truncate text-left w-full">
                                  {result.content}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center gap-1">
                              <p className="text-xs flex items-center">
                                {" "}
                                {type !== "w" && type !== "d" ? (
                                  <>
                                    {amount}
                                    {type}
                                  </>
                                ) : (
                                  <>
                                    <span> {convoMonth.slice(0, 3)}</span>
                                    <span>{convoDay}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </Button>
                        );
                      })}
                    </>
                  )}
                </>
              )}
              {isFetchingNextPage && (
                <div className="w-full  overflow-hidden flex items-center justify-center px-p-half py-8 ">
                  <Loader className="h-4 w-4 animate-spin" />
                </div>
              )}
              <div ref={ref} className=""></div>
            </>
          )}
        </>
      )}
    </section>
  );
};
