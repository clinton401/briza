import {FC} from "react";
import {notable} from "@/lib/fonts";
import getServerUser from "@/hooks/get-server-user"
import {BookmarkPageUI} from "@/components/bookmarks/bookmark-page-ui";
export const metadata = {
    title: 'Bookmarks',
    description: 'View all the posts you’ve saved to revisit later on Briza.',
  };
  
const BookmarksPage : FC= async()=> {
    const session = await getServerUser();
    if(!session) return;
    return (
        <div className="w-full ">
            <h1 className={`${notable.className} w-full sticky bg-background z-50 top-0 left-0 px-p-half py-4 border-b  font-black text-lg`}>
                Bookmarks
            </h1>
            <BookmarkPageUI session={session}/>
        </div>
    )
}



export default BookmarksPage