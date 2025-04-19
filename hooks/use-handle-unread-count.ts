import {useEffect} from "react"
import fetchData from "@/hooks/fetch-data";
import { unknown_error } from "@/lib/variables";
import { supabase } from "@/lib/supabase";
import { type NotificationEvent } from "@/components/notifications/notification-page-ui";
import type { SessionType } from "@/lib/types";

import { useQueryClient, QueryFunctionContext } from "@tanstack/react-query";
import { hasAtLeastOneProperty } from "@/lib/random-utils";

type NotificationQueryKey = ["notifications-count"];
const useHandleUnreadCount = (session: SessionType | undefined)=> {
    if(!session ) return{isLoading: false, error: null, notificationsCount: undefined};
    const fetchUnreadNotificationsCount = async ({
        queryKey,
        signal,
      }: QueryFunctionContext<NotificationQueryKey>): Promise<number> => {
        const response = await fetch(`/api/notifications/unread`, { signal });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.error || unknown_error);
        }
        const data = await response.json();
        return data.count;
      };
      const {
        isLoading,
        error,
        data: notificationsCount,
        refetch,
      } = fetchData<number, NotificationQueryKey>(
        ["notifications-count"],
        fetchUnreadNotificationsCount,
        // { enabled: false }
      );
      const queryClient = useQueryClient();
    //   useEffect(() => {
    //     if (session) {
    //       refetch();
    //     }
    //   }, [session]);
      useEffect(() => {
        const channel = supabase.channel("custom-all-channel");
        if (session) {
          channel.on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "Notification" },
            async (payload) => {
              const data = payload as unknown as NotificationEvent;
              const isNewAvailable = hasAtLeastOneProperty(data.new);
              if (data.errors) return;
              if (
                isNewAvailable &&
                "userId" in data.new &&
                data.new.userId === session.id
              ) {
                await queryClient.invalidateQueries(
                  {
                    queryKey: ["notifications"],
                    exact: true,
                    refetchType: "active",
                  },
                  {
                    throwOnError: true,
                    cancelRefetch: true,
                  }
                );
                // await queryClient.invalidateQueries(
                //   {
                //     queryKey: ["notifications-count"],
                //     exact: true,
                //     refetchType: "active",
                //   },
                //   {
                //     throwOnError: true,
                //     cancelRefetch: true,
                //   }
                // );
                queryClient.setQueryData(["notifications-count"], (old: number) => {
                 
                  return old + 1
                })
              }
            }
          );
    
          channel.subscribe((status, error) => {
            if (error) {
              console.error("Subscription error:", error, status);
            }
          });
        }
    
        return () => {
          channel
            .unsubscribe()
            .catch((error) => console.error("Error unsubscribing:", error));
        };
      }, [session]);

      return {isLoading, error, notificationsCount}
}

export default useHandleUnreadCount;