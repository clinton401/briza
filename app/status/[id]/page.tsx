import { FC } from "react";
import { getPost } from "@/actions/get-post";
import { unknown_error } from "@/lib/variables";
import { PostPageUI } from "@/components/post-page/post-page-ui";

import getServerUser from "@/hooks/get-server-user";
import {ErrorComp} from "@/components/error-comp";
type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};
const PostStatus: FC<PostPageProps> = async ({ params }) => {
  const session = await getServerUser();
  if (!session) return null;
  const { id } = await params;

  return (
    <div className="w-full block   ">



      {" "}
      <PostPageUI postId={id} session={session}/>
    </div>
  );
};
export default PostStatus;
