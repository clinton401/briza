import NextAuth from "next-auth";
import authConfig from "@/auth.config";
const { auth } = NextAuth(authConfig);
import {
  DEFAULT_LOGIN_REDIRECT,
  authRoutes,
  publicRoutes,
  apiAuthPrefix
} from "@/routes";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = !!authRoutes.find(route => nextUrl.pathname.startsWith(route));
  const isPublicRoute = !!publicRoutes.find(route => nextUrl.pathname.startsWith(route));
const redirect  = isApiAuthRoute || nextUrl.pathname === DEFAULT_LOGIN_REDIRECT ? null:  nextUrl.pathname ;
  if (isApiAuthRoute) return;

  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return Response.redirect(
      new URL(
        `/login${redirect ? `?redirect=${encodeURIComponent(redirect)}`: ""}`,
        nextUrl
      )
    );
  }

  return ;
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
  runtime: "nodejs",
  unstable_allowDynamic: [
      "/src/db/lib/db",
      "/node_modules/mongoose/dist/**",
  ]
};
