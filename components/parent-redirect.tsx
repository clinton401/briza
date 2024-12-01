"use client";
import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, useEffect } from "react";
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes } from "@/routes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import type { SessionType } from "@/lib/types";

export const ParentRedirect: FC<{
  session: SessionType | undefined;
  children: ReactNode;
}> = ({ session, children }) => {
  const { push } = useRouter();
  const pathname = usePathname();

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isAuthRoute =
    authRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/complete-profile";
  const redirect =
    isApiAuthRoute || pathname === DEFAULT_LOGIN_REDIRECT ? null : pathname;

  const handleRedirect = () => {
    if (!session) {
      //   push(`/login${
      //       redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
      //     }`);
      return;
    }

    if (
      pathname !== "/complete-profile" &&
      (!session.username || !session.bio || !session.profilePictureUrl)
    ) {
      push(
        `/complete-profile${
          redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""
        }`
      );
      return;
    }

    if (
      session.username &&
      session.bio &&
      session.profilePictureUrl &&
      pathname === "/complete-profile"
    ) {
      push(DEFAULT_LOGIN_REDIRECT);
      return;
    }
  };

  useEffect(() => {
    handleRedirect();
  }, [session, pathname, redirect]);

  return (
    <>
      {isAuthRoute ? (
        children
      ) : (
        <>
          <div className="flex md:hidden">{children}</div>
          <div className="hidden md:flex">
            <SidebarProvider>
              <AppSidebar session={session} />
              <SidebarTrigger /> {children}{" "}
            </SidebarProvider>
          </div>
        </>
      )}
    </>
  );
};
