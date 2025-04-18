import { FC } from "react";
import { ChatPageUI } from "@/components/conversations/chat-page-ui";
import getServerUser from "@/hooks/get-server-user";
import { Metadata } from 'next';
import { prisma } from '@/lib/db';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const session = await getServerUser();
    if (!session) {
      return {
        title: 'Conversation',
        description: 'Private conversation on Briza.',
      };
    }
const { id } = await params;
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!conversation) {
      return {
        title: 'Conversation Not Found',
        description: 'This conversation does not exist or may have been deleted.',
      };
    }

    const currentUserId = session.id;
    const otherUser = conversation.user1.id === currentUserId ? conversation.user2 : conversation.user1;

    return {
      title: otherUser?.name || 'Conversation',
      description: `Private conversation with ${otherUser?.name || 'a user'} on Briza.`,
    };

  } catch (error) {
    console.error('Error generating metadata for conversation:', error);
    return {
      title: 'Conversation',
      description: 'An error occurred while loading the conversation.',
    };
  }
}

const ChatPage: FC<{
  params: Promise<{
    id: string;
  }>;
}> = async ({ params }) => {  
     const session = await getServerUser();
    if(!session) return;
  const { id } = await params;
  return <ChatPageUI id={id} session={session}/>;
};

export default ChatPage;
