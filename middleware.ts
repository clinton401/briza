import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  publicRoutes,
  apiAuthPrefix,
} from "@/routes";

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const session = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
  });

  const isLoggedIn = !!session;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  const redirect =
    isApiAuthRoute || nextUrl.pathname === DEFAULT_LOGIN_REDIRECT
      ? null
      : nextUrl.pathname;

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
    }
    return NextResponse.next();
  }

  // if (
  //   isLoggedIn &&
  //   session &&
  //   (!session.username || !session.bio) &&
  //   nextUrl.pathname !== "/complete-profile"
  // ) {
  //   return NextResponse.redirect(
  //     new URL(
  //       `/complete-profile${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`,
  //       req.url
  //     )
  //   );
  // }

  // if (
  //   isLoggedIn &&
  //   session &&
  //   session.username &&
  //   session.bio &&
  //   nextUrl.pathname === "/complete-profile"
  // ) {
  //   return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  // }

  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(
      new URL(
        `/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`,
        req.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
  runtime: "nodejs",
};
