"use client";
import { FC, ReactNode, useEffect } from "react";
import { SessionType, ConversationType, MessageType } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export type Message = {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  isDeleted: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConversationUserStatus = {
  id: string;
  conversationId: string;
  userId: string;
  isBlocked: boolean;
  isDeleted: boolean;
  isRead: boolean;
};

export type SupabaseRealtimeEvent<T> = {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: { id: string } | null;
  errors: string | null;
};

export const ConversationSocketUpdate: FC<{
  children: ReactNode;
  session: SessionType | undefined;
}> = ({ children, session }) => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  useEffect(() => {
    const channel = supabase.channel("custom-all-channel");
    if (session) {
      const handleReconnect = async() => {
        await queryClient.invalidateQueries({ queryKey: ["conversations"] });
        if(id){
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["messages", id] }),
            queryClient.invalidateQueries({ queryKey: ["conversation", id] }),

          ])
        }
      };
      channel.on('system', { event: 'reconnected' }, () => {
        console.log('Reconnected to Supabase Realtime!');
        handleReconnect();
      });
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Conversation" },
        (payload) => {
        //   console.log({ convoUpdate: payload });
          const unknownPayload = payload as unknown;
          const data = unknownPayload as SupabaseRealtimeEvent<Conversation>;
          const updatedConversation = (
            data 
          ).new;

          if (data.errors) return;
          if (
             updatedConversation &&
            (updatedConversation.user1Id === session.id ||
              updatedConversation.user2Id === session.id)
          ) {
            const { updatedAt } = updatedConversation;
            queryClient.setQueryData(
              ["conversation", updatedConversation.id],
              (old: ConversationType) => {
                if (!old) return;
                return {
                  ...old,
                  updatedAt,
                };
              }
            );

            queryClient.setQueryData(["conversations"], (old: {pageParams: number[],pages: {data: ConversationType[]}[]}| null) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.map((convo: ConversationType) =>
                    convo?.id === updatedConversation.id
                      ? {
                          ...convo,
                          updatedAt,
                        }
                      : convo
                  ),
                })),
              };
            });
          }
        }
      );
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Conversation" },
        async (payload) => {
        //   console.log({ newConvo: payload });
          const unknown_payload = payload as unknown;
          const data = unknown_payload as SupabaseRealtimeEvent<Conversation>
          const updatedConversation = (
            data
          ).new;

          if (data.errors) return;
          if (
            updatedConversation &&
            (updatedConversation.user1Id === session.id ||
              updatedConversation.user2Id === session.id)
          ) {
            await queryClient.invalidateQueries(
              {
                queryKey: ["conversations"],
                exact: true,
                refetchType: "active",
              },
              {
                throwOnError: true,
                cancelRefetch: true,
              }
            );
          }
        }
      );
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Message" },
        async(payload) => {
          // console.log({ newMessage: payload });
          const unknown_payload = payload as unknown;
          const data = unknown_payload as SupabaseRealtimeEvent<Message>;
          const payloadMessage = (data ).new;

          if (data.errors) return;
          if (payloadMessage && payloadMessage.senderId !== session.id) {
            
const originalDate = new Date(payloadMessage.createdAt);
const oneHourInMs = 60 * 60 * 1000;
const newDate = new Date(originalDate.getTime() + oneHourInMs);
            const newMessage = {
              ...payloadMessage,
createdAt: newDate
            }
            const cleanedMessage = { ...newMessage };
            // delete cleanedMessage.isDeleted;
            queryClient.setQueryData(
              ["messages", cleanedMessage.conversationId],
              (
                old: {
                  pageParams: number[];
                  pages: { data: MessageType[] }[];
                } | null
              ) => {
                if (!old) return old;
                return {
                  ...old,
                  pages: old.pages.map((page, index) => {
                    if (index === 0) {
                      return { ...page, data: [cleanedMessage, ...page.data] };
                    }
                    return page;
                  }),
                };
              }
            );

            queryClient.setQueryData(
              ["conversations"],
              (
                old: {
                  pageParams: number[];
                  pages: { data: ConversationType[] }[];
                } | null
              ) => {
                if (!old) return old;
                return {
                  ...old,
                  pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.map((convo: ConversationType) =>
                      convo?.id === newMessage.conversationId
                        ? {
                            ...convo,
                            lastMessage: cleanedMessage.content,
                            lastMessageAt: cleanedMessage.createdAt,
                            isRead: false,
                          }
                        : convo
                    ),
                  })),
                };
              }
            );
            queryClient.setQueryData(
              ["conversation", newMessage.conversationId],
              (old: ConversationType) => {
                if (!old) return;
                return {
                  ...old,
                  lastMessage: cleanedMessage.content,
                  lastMessageAt: cleanedMessage.createdAt,
                  isRead: false,
                };
              }
            );
            setTimeout(() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }, 500);
          }
        }
      );
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ConversationUserStatus" },
        async (payload) => {
        //   console.log({ convoUserStatusUpdate: payload });
          const unknown_data = payload as unknown;
          const data = unknown_data as SupabaseRealtimeEvent<ConversationUserStatus>
          const updatedStatus = (
            data 
          ).new;

          if (data.errors) return;
          if (updatedStatus && updatedStatus.userId === session.id) {
            await queryClient.invalidateQueries(
                {
                  queryKey: ["conversations"],
                  exact: true,
                  refetchType: "active",
                },
                {
                  cancelRefetch: false, 
                  throwOnError: true,
                }
              );
              
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
  }, [session, id]);
  return <>{children}</>;
};
