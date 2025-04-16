import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import {  ConversationType } from "@/lib/types"

const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      convoId,
      message,
      senderId,
      receiverId
    }: {
      convoId: string;
      message: string;
      senderId: string;
      receiverId: string;
    }) => {
      try {
        await axios.post(`/api/conversations/${convoId}/messages`, { content: message, receiverId });

        return {
          convoId, message, senderId,
          receiverId
        }
      } catch (error: any) {
        console.error(error.response?.data)
        throw new Error(error.response?.data?.error || `Failed to send message`);
      }

    },
    onMutate: async ({ convoId, message, senderId,
      receiverId }) => {
      await queryClient.cancelQueries({ queryKey: ["conversations"], exact: true });
      await queryClient.cancelQueries({ queryKey: ["messages", convoId], exact: true });
      await queryClient.cancelQueries({ queryKey: ["conversation", convoId], exact: true });


      const previousConversations = queryClient.getQueryData(["conversations"]);
      const previousConvoMessages = queryClient.getQueryData(["messages", convoId]);
      const previousConversation = queryClient.getQueryData(["conversation", convoId]);


      const date = new Date();
      

      queryClient.setQueryData(["conversation", convoId], (old: ConversationType) => {
        if (!old) return;
        return {
          ...old,
          lastMessage: message,
          lastMessageAt: date,
          isRead: true
        }
      })

      queryClient.setQueryData(["conversations"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((convo: ConversationType) =>
              convo?.id === convoId
                ? {
                  ...convo,
                  lastMessage: message,
                  lastMessageAt: date,
                  isRead: true
                }
                : convo
            ),
          })),
        };
      });
  


      return { previousConversations, previousConvoMessages, previousConversation };
    },
    onError: (err, variables, context) => {

      if (context?.previousConversations) {
        queryClient.setQueryData(["conversations"], context.previousConversations);
      }
      if (context?.previousConvoMessages && variables?.convoId) {
        queryClient.setQueryData(
          ["messages", variables.convoId],
          context.previousConvoMessages
        );
      }
      if (context?.previousConversation && variables?.convoId) {
        queryClient.setQueryData(
          ["conversation", variables.convoId],
          context.previousConversation
        );
      }
    },
    onSettled: async (data, error, variables) => {
      if (!variables.convoId) return;

      await Promise.all([
         queryClient.invalidateQueries(
          {
            queryKey: ["conversations"],
            exact: true,
            refetchType: "active",
          },
          {
            cancelRefetch: false, 
            throwOnError: true,
          }
        )
        ,
        queryClient.invalidateQueries(
          {
            queryKey: ["messages", variables.convoId],
            exact: true,
            refetchType: "active",
          },
          {
            throwOnError: true,
            cancelRefetch: false,
          }
        )
      ])

    },
  });
};

export default useSendMessage;
