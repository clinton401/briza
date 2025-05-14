"use client";
import { FC, ReactNode, createContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { notable } from "@/lib/fonts";
import { ArrowLeft, Loader } from "lucide-react";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { unknown_error } from "@/lib/variables";
import { type NotFollowedUsers } from "@/lib/types";
import { useInView } from "react-intersection-observer";
import { removeDuplicates } from "@/lib/random-utils";

type FollowContextType = {
  filter: "FOLLOWERS" | "FOLLOWING";
  users: NotFollowedUsers[];
  followId: string;
};
export const FollowContext = createContext<FollowContextType>({
  filter: "FOLLOWERS",
  users: [],
  followId: "",
});
type FetchFollowResult = {
  data: NotFollowedUsers[];
  nextPage?: number;
};

export const UserFollowLayout: FC<{ id: string; children: ReactNode }> = ({
  id,
  children,
  

}) => {
  const [filter, setFilter] = useState<"FOLLOWERS" | "FOLLOWING">("FOLLOWERS");
  const fetchUsers = async ({
    pageParam = 1,
    signal,
  }: {
    pageParam?: number;
    signal?: AbortSignal;
  }): Promise<FetchFollowResult> => {
    const response = await fetch(
      `/api/users/${id}/follow?page=${pageParam}&filter=${filter}`,
      { signal }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || unknown_error);
    }
    const data = await response.json();
    return {
      data: data.users,
      nextPage: data.nextPage,
    };
  };

  const {
    data: users,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteScroll<NotFollowedUsers, FetchFollowResult>(
    ({ pageParam = 1, signal }) => fetchUsers({ pageParam, signal }),
    ["follow", id, filter.toLowerCase()]
  );
  const { ref, inView } = useInView();
  const pathname = usePathname();
  const { push } = useRouter();
  const url = `/user/${id}`;
  useEffect(() => {
    const getFilterFromPath = () => {
      if (pathname === `${url}/followers`) return "FOLLOWERS";
      if (pathname === `${url}/following`) return "FOLLOWING";
      return filter;
    };

    setFilter(getFilterFromPath());
  }, [pathname]);
  useEffect(() => {
    if (!isLoading && !error && users && inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage, isLoading, error]);
  const backHandler = () => {
    push(url);
  };

  const values = {
    filter,
    users: removeDuplicates(users || []),
    followId: id,
  };

  const message =
    filter.toLowerCase() === "followers"
      ? "No followers yet. Stay tuned for new connections."
      : "Not following anyone yet. Explore and connect with others.";

  return (
    <>
      <section className="flex justify-between gap-x-2 gap-y-4 px-p-half  z-50 sticky flex-wrap bg-background top-0 left-0  w-full items-center py-2">
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full items-center justify-center border-none"
            onClick={backHandler}
          >
            <ArrowLeft  />
          </Button>
          <span className="flex  gap-1 flex-col">
            <h2 className={`font-bold text-lg ${notable.className}`}>
              Follows
            </h2>
          </span>
        </div>
      </section>
      <section className="w-full flex items-center py-4 *:w-1/2 *:rounded-none flex-wrap  *:py-6 justify-center ">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setFilter("FOLLOWERS");
            push(`${url}/followers`);
          }}
          className={`${filter === "FOLLOWERS" ? "bg-secondary" : ""}`}
        >
          Followers
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setFilter("FOLLOWING");
            push(`${url}/following`);
          }}
          className={`${filter === "FOLLOWING" ? "bg-secondary" : ""}`}
        >
          Following
        </Button>
      </section>
      {isLoading && (
        <section className="w-full flex items-center justify-center py-4 ">
          <Loader className=" h-6 w-6 animate-spin" />
        </section>
      )}
      {!isLoading && (error || !users) && (
        <section className="w-full flex items-center flex-col pt-4  gap-4">
          <h2 className={`${notable.className} w-full text-center font-bold`}>
            {error?.message || unknown_error}
          </h2>
          <Button onClick={refetch}>Retry</Button>
        </section>
      )}
      <FollowContext.Provider value={values}>
        {!isLoading && !error && users && (
          <>
            {users.length < 1 ? (
              <p className="w-full text-center px-p-half">{message}</p>
            ) : (
              <>{children}</>
            )}
          </>
        )}
      </FollowContext.Provider>
      {isFetchingNextPage && (
        <section className="w-full  overflow-hidden flex items-center justify-center py-8 ">
          <Loader className="h-4 w-4 animate-spin" />
        </section>
      )}
      <section ref={ref} className=""></section>
    </>
  );
};
