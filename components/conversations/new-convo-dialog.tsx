"use client";
import { FC, ReactNode, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import fetchData from "@/hooks/fetch-data";
import { unknown_error } from "@/lib/variables";
import { InputSearchUser } from "@/lib/types";
import { QueryFunctionContext } from "@tanstack/react-query";
import { notable } from "@/lib/fonts";
import { useRouter } from "next/navigation";
import { Search, Loader, User2, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createConversation } from "@/actions/create-conversation";
import createToast from "@/hooks/create-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getUppercaseFirstLetter } from "@/lib/random-utils";

export const NewConvoDialog: FC<{ children: ReactNode }> = ({ children }) => {
  const [inputValue, setInputValue] = useState("");
  const [isCreatePending, setIsCreatePending] = useState(false);
  const { push } = useRouter();
  const [debouncedSearch] = useDebounce(inputValue, 500);

  const { createSimple, createError } = createToast();
  const queryClient = useQueryClient();
  const dialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const fetchUsers = async ({
    signal,
  }: QueryFunctionContext): Promise<InputSearchUser[]> => {
    const response = await fetch(
      `/api/search/input-users?query=${debouncedSearch}&filter=conversation`,
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
    refetch,
  } = fetchData<InputSearchUser[], ["convo-user-search", string]>(
    ["convo-user-search", debouncedSearch.toLowerCase()],
    fetchUsers,
    { enabled: !!debouncedSearch }
  );

  const createConvo = async (recipientId: string) => {
    if (isCreatePending) return createError("A conversation is being created");
    try {
      setIsCreatePending(true);
      const result = await createConversation(recipientId);
      const { error, data, message } = result;
      if (error || !data) {
        return createError(error || unknown_error);
      }
      await queryClient.invalidateQueries(
        {
          queryKey: ["conversations"],
          exact: true,
          refetchType: "active",
        },
        {
          cancelRefetch: false, 
          throwOnError: true,
        }
      );
      createSimple(message || "Conversation created successfully");
      if (dialogTriggerRef.current) {
        dialogTriggerRef.current.click();
      }
      push(`/messages/${data.id}`)
    } catch (error) {
      console.error("Error creating conversation:", error);
      return createError(unknown_error);
    } finally {
      setIsCreatePending(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild ref={dialogTriggerRef}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]  ">
        <DialogHeader className="">
          <DialogTitle className={`${notable.className}`}>
            New message
          </DialogTitle>
          <DialogDescription>
        
Search for a user by name, click on their profile to start a conversation.
            </DialogDescription>
        </DialogHeader>
        <div className=" w-full min-w-[300px]  mt-4 relative ">
          <Input
            value={inputValue}
            placeholder="Search for user"
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full pl-[40px]  placeholder:italic italic rounded-full"
          />

          <Search className="absolute left-3 h-4 w-4  top-1/2 translate-y-[-50%]  text-gray-300 " />
        </div>

        <div className="w-full h-[50dvh] min-h-[250px]  max-h-[400px] overflow-y-auto gap-4 flex flex-col">
          {/* <div className="w-full min-h-[200px]"> */}
          {(isLoading || isCreatePending) && (
            <div className="w-full flex items-center justify-center p-4">
              <Loader className="animate-spin h-4 w-4" />
            </div>
          )}
          {!isLoading && error && (
            <div className="w-full flex items-center flex-col justify-center gap-4 p-4">
              <p className="text-center w-full  text-sm">{error?.message}</p>
              <Button
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
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
                        createConvo(user.id);
                      }}
                      disabled={isCreatePending}
                      className="w-full py-2 flex h-auto border-none  justify-start items-center gap-2"
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
                        <p className="truncate text-left  flex items-center  w-full">
                          {getUppercaseFirstLetter(user.name)}
                          {user.blueCheckVerified && (
                            <span className="h-4 ml-1 aspect-square rounded-full bg-[#1DA1F2] flex items-center justify-center text-white">
                              <Check className="h-1 w-1" />
                            </span>
                          )}
                        </p>
                        <p className="text-muted-foreground  truncate text-left w-full">
                          @{user.username}
                        </p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </>
          )}
          {debouncedSearch &&
            !isLoading &&
            !error &&
            users &&
            users.length < 1 && (
              <div className="w-full flex items-center justify-center p-4">
                <p className="text-muted-foreground text-sm">No users found</p>
              </div>
            )}
        </div>
        {/* </div> */}
        {/* <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};
