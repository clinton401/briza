import NextAuth from "next-auth";
import authConfig from "@/auth.config";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
  authPrefix,
} from "@/routes";

export default async function authHandler(req) {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isApiAuthRoute = !!authRoutes.find(route => nextUrl.pathname.startsWith(route));
  const isPublicRoute = !!publicRoutes.find(route => nextUrl.pathname.startsWith(route));

  if (isApiAuthRoute) return;

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(
      new URL(
        `/login`,
        nextUrl
      )
    );
  }

  return await NextAuth(authConfig);
}

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
