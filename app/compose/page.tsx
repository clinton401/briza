import { FC } from "react";
import { CreatePostUI } from "@/components/post/create-post-ui";
import getServerUser from "@/hooks/get-server-user";

export const metadata = {
  title: "Compose Post",
  description:
    "Share your thoughts with the world by composing a new post on Briza.",
};

const ComposePage: FC = async () => {
  const session = await getServerUser();
  if (!session) return;
  return <CreatePostUI session={session} />;
};

export default ComposePage;
