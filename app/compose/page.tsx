import {FC} from "react";
import {CreatePostUI} from "@/components/post/create-post-ui";
import getServerUser from "@/hooks/get-server-user"


const ComposePage: FC = async() => {
    const session = await getServerUser();
    if (!session) return;
    return <CreatePostUI session={session}/>
}

export default ComposePage;