"use client";
import { FC } from "react";
import { notable } from "@/lib/fonts";
import type { NotFollowedUsers } from "@/lib/types";
import { NotFollowedCard } from "@/components/home/not-followed-card";
import { SuggestionLoader } from "@/components/loaders/suggestion-loaders";
import { unknown_error } from "@/lib/variables";
import { Button } from "@/components/ui/button";
// import { CreateMultipleData } from "@/components/create-multiple-data";
import { QueryFunctionContext } from "@tanstack/react-query";
import fetchData from "@/hooks/fetch-data";
const fetchUsers = async ({
  signal,
}: QueryFunctionContext): Promise<NotFollowedUsers[]> => {
  const response = await fetch("/api/users/not-following", { signal });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();
  return data.users;
};
export const HomeAside: FC = () => {
  const {
    error,
    isLoading,
    data: users,
    refetch,
  } = fetchData<NotFollowedUsers[], string[]>(
    ["not-followed-users"],
    fetchUsers,
    { enabled: true }
  );
  const skeletonArray = Array.from({ length: 6 }, (_, index) => index + 1);
  return (
    <aside className="w-[20rem] hidden lg:flex fixed  top-0 h-dvh  overflow-hidden right-0 border-l ">
      <section
        className="w-full px-4 py-6 h-full overflow-x-hidden overflow-y-auto
      "
      >
        <div className="flex  w-full flex-col gap-6">
          <h3 className={`${notable.className} text-lg font-bold`}>
            Suggestions
          </h3>
          {!error && (
            <div className="w-full flex flex-col gap-4">
              {isLoading ? (
                <>
                  {skeletonArray.map((user) => {
                    return (
                      <div key={user} className="w-full">
                        <SuggestionLoader />
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  {users && (
                    <>
                      {" "}
                      {users.map((user) => {
                        return (
                          <div key={user.username} className="w-full">
                            <NotFollowedCard user={user} />
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          )}
          {!isLoading && (error || !users) && (
            <div className="flex flex-col items-center gap-4">
              <h3 className="w-full text-center text-semibold text-lg">
                {error?.message || unknown_error}
              </h3>

              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => refetch()}
              >
                Retry
              </Button>
            </div>
          )}
          {/* <CreateMultipleData /> */}
        </div>
      </section>
    </aside>
  );
};
