"use client";

import { usePathname } from "next/navigation";
import { ConversationLayout } from "./conversation-layout";
import {ReactNode} from "react"

export function ConversationWrapper({children}: {children: ReactNode}) {
  const pathname = usePathname();

  const isChatPage = /^\/messages\/[^/]+$/.test(pathname);

  return (
    <>
    <aside
      className={`lg:w-[22rem] flex w-screen lg:fixed lg:top-0 lg:h-dvh overflow-x-hidden lg:overflow-y-auto lg:left-[20rem] lg:border-r ${
        isChatPage ? "hidden lg:flex" : ""
      }`}
    >
      <ConversationLayout />
    </aside>

      <div className={`${!isChatPage ? "hidden lg:flex" : ""} w-full lg:pl-[22rem]`}>{children}</div>
    </>
  );
}
