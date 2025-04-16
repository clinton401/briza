"use client";

import { usePathname } from "next/navigation";
import { ConversationLayout } from "./conversation-layout";

export function ConversationWrapper() {
  const pathname = usePathname();

  const isChatPage = /^\/messages\/[^/]+$/.test(pathname);

  return (
    <aside
      className={`lg:w-[22rem] flex w-full lg:fixed lg:top-0 lg:h-dvh overflow-x-hidden lg:overflow-y-auto lg:left-[20rem] lg:border-r ${
        isChatPage ? "hidden lg:flex" : ""
      }`}
    >
      <ConversationLayout />
    </aside>
  );
}
