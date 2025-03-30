import {FC} from "react";
import { SearchPageUI } from "@/components/search/search-page-ui";
import getServerUser from "@/hooks/get-server-user"


const SearchPage: FC = async() => {
    const session = await getServerUser();
    if(!session) return;
    return (
        <SearchPageUI session={session}/>
    )
}

export default SearchPage