"use client";
import { FC, useEffect } from "react";
import {
  NotificationType,
  NotificationWithTriggeredBy,
  SessionType,
} from "@/lib/types";
import { unknown_error } from "@/lib/variables";
import useInfiniteScroll from "@/hooks/use-infinite-scroll";
import { Loader, BellDot } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { notable } from "@/lib/fonts";
import { NotificationCard } from "./notification-card";
import { markNotificationsAsRead } from "@/actions/mark-notifications-as-read";
import { useQueryClient } from "@tanstack/react-query";
type FetchNotificationsResult = {
  data: NotificationWithTriggeredBy[];
  nextPage?: number;
};
type NewNotificationEvent = {
  createdAt: string;
  id: string;
  isRead: boolean;
  triggeredById: string;
  type: NotificationType;
  url: string;
  userId: string;
};
export type NotificationEvent = {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: NewNotificationEvent | {};
  old: Record<string, any> | null;
  errors: any;
};
const fetchNotifications = async ({
  pageParam = 1,
  signal,
}: {
  pageParam?: number;
  signal?: AbortSignal;
}): Promise<FetchNotificationsResult> => {
  const response = await fetch(`/api/notifications?page=${pageParam}`, {
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error || unknown_error);
  }
  const data = await response.json();
  return {
    data: data.notifications,
    nextPage: data.nextPage,
  };
};

export const NotificationPageUI: FC<{ session: SessionType }> = ({
  session,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useInfiniteScroll<NotificationWithTriggeredBy, FetchNotificationsResult>(
    ({ pageParam = 1, signal }) => fetchNotifications({ pageParam, signal }),
    ["notifications"]
  );
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const handleUnreadNotifications = async () => {
    try {
      const response = await markNotificationsAsRead();
      const { error, success } = response;
      if (error) {
        console.error(error);
      }
      if (success) {
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
        await queryClient.invalidateQueries(
          {
            queryKey: ["notifications-count"],
            exact: true,
            refetchType: "active",
          },
          {
            throwOnError: true,
            cancelRefetch: true,
          }
        );
      }
    } catch (error) {
      console.error(`Unable to mark notifications as read: ${error}`);
    }
  };
  useEffect(() => {
    if (!isLoading) {
      handleUnreadNotifications();
    }
  }, [isLoading]);
  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage]);


  if (isLoading)
    return (
      <div className="w-full flex items-center justify-center py-8 ">
        <Loader className=" h-6 w-6 animate-spin" />
      </div>
    );
  if (error || !data) {
    const errorMessage = error?.message || unknown_error;
    return (
      <div className="w-full flex items-center flex-col pt-4 gap-4">
        <h2
          className={`${notable.className} w-full text-center font-black text-lg`}
        >
          {errorMessage}
        </h2>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }
  return (
    <div className="w-full pb-16 md:pb-8  ">
      {data.length < 1 && (
        <section className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-secondary  p-4 mb-4">
            <BellDot className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            No notifications
          </h2>
          <p className="text-gray-5 text-center max-w-sm">
            When you have notifications, they'll show up here. Stay tuned for
            updates!
          </p>
        </section>
      )}
      {data.length > 0 && (
        <>
          {data.map((notification: NotificationWithTriggeredBy, index) => {
            return (
              <NotificationCard
                key={notification.id}
                notification={notification}
                index={index}
              />
            );
          })}
        </>
      )}
      {isFetchingNextPage && (
        <section className="w-full  overflow-hidden flex items-center justify-center py-8 ">
          <Loader className="h-4 w-4 animate-spin" />
        </section>
      )}
      <section ref={ref} className="w-full"></section>
    </div>
  );
};
