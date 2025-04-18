import { FC } from "react";
import { Button } from "@/components/ui/button";
import { notable } from "@/lib/fonts";
// import { useRouter, usePathname } from "next/navigation";

export const ErrorComp: FC<{ message: string, refetch?: () => void }> = ({ message, refetch }) => {
 
  const navigationHandler = () => {
    // if (pathname !== "/") {
    //   push("/");
    // } else {
    if(refetch){
      refetch()
    } else {
      window.location.reload();
    }
    
   
  };
  return (
    <div className=" min-h-dvh w-full overflow-hidden py-8 px-p-half flex flex-col flex-wrap items-center gap-4 justify-center ">
      <h1
        className={`w-full text-center text-destructive text-4xl font-black uppercase  ${notable.className}`}
      >
        Something went wrong
      </h1>
      <h2 className={`w-full text-center  break-words  text-2xl font-bold  `}>
        {message}
      </h2>
      <Button size="lg" onClick={navigationHandler}>
        REFRESH
      </Button>
    </div>
  );
};
