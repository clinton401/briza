import {FC} from 'react'
import getServerUser from "@/hooks/get-server-user";
import {UserPageUI} from "@/components/user/user-page-ui"
type UserPageProps = {
  params: Promise<{
    id: string;
  }>;
};
const UserPage: FC<UserPageProps> = async ({params}) => {
  const session = await getServerUser();
  if (!session) return null;
  const { id} = await params;

  return <UserPageUI  session={session} id={id}/>
}

export default UserPage
