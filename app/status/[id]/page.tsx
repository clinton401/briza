import { FC } from "react";
import { PostPageUI } from "@/components/post-page/post-page-ui";

import getServerUser from "@/hooks/get-server-user";

import { prisma } from '@/lib/db';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: postId } = await params;
try{
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          name: true,
          username: true,
        },
      },
      media: true,
    },
  });

  if (!post) {
    return {
      title: 'Post',
      description: 'This post could not be found or has been removed.',
    };
  }

  const title = post.content ? post.content : 'Post on Briza'; 

  return {
    title,
    description: post.content
      ? `${post.content.slice(0, 120)}${post.content.length > 120 ? '...' : ''}`
      : 'This post does not have any content.',
  };
} catch (error) {
  console.error(`Unable to get post details for metadata : ${error} `)
  return {
    title: 'Post',
    description: 'An error occurred while trying to fetch the post. Please try again later.',
  };
}
}

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
