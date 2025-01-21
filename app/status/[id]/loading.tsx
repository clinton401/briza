import {FC} from "react";

import {Loader} from "lucide-react"
const PostLoadingPage: FC =() => {
    return (
        <div className="w-full min-h-dvh py-8 px-p-half flex items-center justify-center">
        <Loader  className="h-6 w-6 animate-spin"/>
    </div>
    )
}

export default PostLoadingPage;