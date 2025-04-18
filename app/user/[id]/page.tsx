import {FC} from 'react'
import { prisma } from '@/lib/db';
import getServerUser from '@/hooks/get-server-user';
import { Metadata } from 'next';
import {UserPageUI} from "@/components/user/user-page-ui"
type UserPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try{
  const session = await getServerUser();
  if (!session) {
    return {
      title: 'User Profile',
      description: 'View user profile on Briza.',
    };
  }
    const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id},
    select: {
      name: true,
      username: true,
      bio: true,
    },
  });

  if (!user) {
  return {
      title: 'User Profile',
      description: 'View user profile on Briza.',
    };
  }

  return {
    title: user.name || user.username || 'User Profile',
    description: user.bio
      ? `${user.bio.slice(0, 120)}${user.bio.length > 120 ? '…' : ''}`
      : `See posts and info from ${user.name || user.username} on Briza.`,
  };
}catch(error) {
  console.error('Error fetching user details:', error);
   return {
      title: 'User Profile',
      description: 'View user profile on Briza.',
    };
}
}

const UserPage: FC<UserPageProps> = async ({params}) => {
  const session = await getServerUser();
  if (!session) return null;
  const { id} = await params;

  return <UserPageUI  session={session} id={id}/>
}

export default UserPage
