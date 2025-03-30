import { Dispatch, FC, SetStateAction, useState, useRef } from "react";
import { Input } from "../ui/input";
import { Search, ArrowLeft, X, Loader, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter} from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useDebounce } from "use-debounce";
import fetchData from "@/hooks/fetch-data";
import { unknown_error } from "@/lib/variables";
import { InputSearchUser } from "@/lib/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const appearAnimation = {
  hidden: {
    y: 20,
    filter: "blur(20px)",
    opacity: 0,
  },
  visible: {
    y: 0,
    filter: "blur(0)",
    opacity: 1,
  },
  exit: {
    y: 20,
    filter: "blur(20px)",
    opacity: 0,
  },
};
export const SearchInput: FC<{
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  setConfirmedSearch: Dispatch<SetStateAction<string>>;
  setFilter: Dispatch<SetStateAction<"TOP" | "LATEST" | "MEDIA">>;
  filter: "TOP" | "LATEST" | "MEDIA"
}> = ({ inputValue, setInputValue, setConfirmedSearch, filter, setFilter }) => {
  const [isFocused, setIsFocused] = useState(false);

  const [debouncedSearch] = useDebounce(inputValue, 500);
  const openModal = debouncedSearch.length > 0 && isFocused;
  const { push, back } = useRouter();
  const inputRef = useRef<HTMLInputElement | null >(null);

  const fetchUsers = async ({
    signal,
  }: QueryFunctionContext): Promise<InputSearchUser[]> => {
    const response = await fetch(
      `/api/search/input-users?query=${debouncedSearch}`,
      { signal }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || unknown_error);
    }
    const data = await response.json();
    return data.users;
  };

  const {
    error,
    isLoading,
    data: users,
  } = fetchData<InputSearchUser[], ["input-user-search", string]>(
    ["input-user-search", debouncedSearch.toLowerCase()],
    fetchUsers,
    { enabled: !!debouncedSearch }
  );
  const backHandler = () => {
    if (window.history.length > 1) {
      back();
    } else {
      push("/");
    }
  };

  const handleSearch = () => {
    if (inputValue.trim().length > 0) {
      setConfirmedSearch(inputValue); 
      inputRef.current?.blur();
    }
  }
   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };
  return (
    <section className="flex justify-between gap-x-2 gap-y-4  border z-50 sticky flex-wrap bg-background top-0 left-0  w-full items-center">
      <div className="w-full flex items-center pt-2 gap-x-6 gap-y-4 px-p-half relative flex-wrap">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full items-center  flex  justify-center  border-none"
          onClick={backHandler}
        >
          <ArrowLeft className="mr-1" />
        </Button>

        <div className=" grow min-w-[300px]  relative ">
          <Input
            value={inputValue}
            placeholder="Search"
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={inputRef}
            onKeyDown ={handleKeyPress}
            className="w-full pl-[40px] pr-[50px] placeholder:italic italic rounded-full"
          />

          <Search className="absolute left-3 h-4 w-4  top-1/2 translate-y-[-50%]  text-gray-300 " />
          {openModal && (
 <Button
 variant="outline"
 size="icon"
 className="absolute right-0 h-full aspect-square top-1/2 translate-y-[-50%] rounded-tr-full rounded-br-full  text-gray-300 "
 onClick={() => {
  if(inputValue.length > 0){
    setInputValue("")
  }
  inputRef.current?.focus()
 }}
>
 <X className="h-4 w-4" />
</Button>
          )}
         
          <AnimatePresence>
            {openModal && (
              <motion.div
                variants={appearAnimation}
                animate="visible"
                initial="hidden"
                exit="exit"
                key="modal"
                className="absolute left-0 w-full top-[120%] bg-background border overflow-x-hidden  max-h-[450px] overflow-y-auto  shadow-lg rounded-md "
              >
                {isLoading && (
                  <div className="w-full flex items-center justify-center p-4">
                    <Loader className="animate-spin h-4 w-4" />
                  </div>
                )}
                {/* {!isLoading && error && (
                  <div className="w-full flex items-center justify-center p-4">
                    <p className="text-center text-sm">{error?.message}</p>
                  </div>
                )} */}
                {!isLoading && debouncedSearch.length > 0 && (
                  // <div className=" w-full border border-red-900">
                  <Button className="w-full py-6  rounded-none truncate " variant="ghost" onClick={handleSearch}>
                    Search for "{debouncedSearch}"
                  </Button>
                  // </div>
                )}

                {!isLoading && !error && users && users.length > 0 && (
                  <>
                    <div className="w-full flex flex-col gap-1">
                      {users.map((user) => {
                        return (
                          <Button
                            key={user.username}
                            variant="outline"
                            onClick={() => {
                              setInputValue("");
                              push(`/user/${user.id}`);
                            }}
                            className="w-full py-2 flex h-auto rounded-none justify-start items-center gap-2"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={user?.profilePictureUrl || ""}
                                alt="User profile picture"
                              />
                              <AvatarFallback>
                                <User2 />
                              </AvatarFallback>
                            </Avatar>
                            <div className=" flex grow items-start flex-col overflow-hidden  justify-center gap-1">
                              <span className="truncate text-left  w-full">
                                {user.name}
                              </span>
                              <span className="text-muted-foreground  truncate text-left w-full">
                                @{user.username}
                              </span>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="w-full flex items-center  *:grow  *:rounded-none flex-wrap  *:py-6 justify-center ">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setFilter("TOP");
          }}
          className={`${filter === "TOP" ? "bg-secondary" : ""}`}
        >
          Top
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setFilter("LATEST");
          }}
          className={`${filter === "LATEST" ? "bg-secondary" : ""}`}
        >
          Latest
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setFilter("MEDIA");
          }}
          className={`${filter === "MEDIA" ? "bg-secondary" : ""}`}
        >
          Media
        </Button>
      </div>
    </section>
  );
};
