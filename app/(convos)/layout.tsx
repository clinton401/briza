// app/messages/layout.tsx
import { ConversationWrapper } from "@/components/conversations/conversation-wrapper";

export const metadata = {
  title: "Messages",
  description: "View all your private conversations on Briza.",
};

export default function ConvoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ConversationWrapper>{children}</ConversationWrapper>;
}
