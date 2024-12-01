"use client";
import { FC, useState, useEffect } from "react";
import { getUsersNotFollowedByCurrentUser } from "@/actions/get-users-not-followed-by-current-user";
import { notable } from "@/lib/fonts";
import type { NotFollowedUsers } from "@/lib/types";
import { NotFollowedCard } from "@/components/home/not-followed-card";
import { SuggestionLoader } from "@/components/loaders/suggestion-loaders";
import { unknown_error } from "@/lib/variables";
import { Button } from "@/components/ui/button";
// import {CreateMultipleData} from "@/components/create-multiple-data"
export const HomeAside: FC = () => {
  const [isPending, setIsPending] = useState(true);
  const [usersNotFollowedByCurrentUser, setUsersNotFollowedByCurrentUser] =
    useState<NotFollowedUsers[]>([]);
  const [error, setError] = useState<undefined | string>(undefined);
  const getNotFollowedUsers = async () => {
    try {
      setIsPending(true);
      setError(undefined);
      const response = await getUsersNotFollowedByCurrentUser();
      const { error, users } = response;
      if (error || !users) {
        setError(error || unknown_error);
        return;
      }

      console.log(users)
      
      setUsersNotFollowedByCurrentUser(users);
    } catch (error) {
      console.error(`Error getting unfollowed users: ${error}`);
      setError(unknown_error);
    } finally {
      setIsPending(false);
    }
  };
  useEffect(() => {
    getNotFollowedUsers()
  }, []);
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
              {isPending ? (
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
                  {usersNotFollowedByCurrentUser.slice(0, 6).map((user) => {
                    return (
                      <div key={user.username} className="w-full">
                        <NotFollowedCard user={user} />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center gap-4">
              <h3 className="w-full text-center text-semibold text-lg">
                {error}
              </h3>

              <Button onClick={getNotFollowedUsers}>Retry</Button>
            </div>
          )}
          {/* <CreateMultipleData/> */}
        </div>
      </section>
    </aside>
  );
};
