import {FC} from "react";
import { NotificationPageUI } from "@/components/notifications/notification-page-ui";
import {notable} from "@/lib/fonts";
import getServerUser from "@/hooks/get-server-user";
export const metadata = {
    title: 'Notifications',
    description: 'Stay up to date with the latest activity on your posts, mentions, and interactions.',
  };
  
const NotificationPage: FC =async() => {
    const session = await getServerUser();
    if(!session) return;
    return (
        <div className="w-full ">
            <h1 className={`${notable.className} w-full sticky bg-background z-50 top-0 left-0 px-p-half py-4 border-b  font-black text-lg`}>
                Notifications
            </h1>
            <NotificationPageUI session={session}/>
        </div>
    )
}


export default NotificationPage