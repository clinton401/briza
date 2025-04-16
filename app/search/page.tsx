import {FC} from "react";
import { SearchPageUI } from "@/components/search/search-page-ui";
import getServerUser from "@/hooks/get-server-user"

export const metadata = {
    title: 'Search',
    description: 'Find people, posts, and conversations that match what you’re looking for on Briza.',
  };
  

const SearchPage: FC = async() => {
    const session = await getServerUser();
    if(!session) return;
    return (
        <SearchPageUI session={session}/>
    )
}

export default SearchPage