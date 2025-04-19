import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import {Lato} from "next/font/google"
import "./globals.css";
import getServerUser from "@/hooks/get-server-user";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner"

import { ParentRedirect } from "@/components/parent-redirect";
import {TanstackQueryClient} from "@/components/tanstack-query-client";
import {ConversationSocketUpdate} from "@/components/conversations/conversation-socket-update"
const lato = Lato({ subsets: ["latin"], weight: ["100", "300" , "400"  , "700", "900" ] });

export const metadata: Metadata = {
  title: {
    default: 'Briza',
    template: '%s | Briza',
  },
  description: 'Briza is a dynamic social media platform that lets you share thoughts, follow people, and join the conversation in real time.',
  
  openGraph: {
    title: 'Briza',
    description: 'Briza is a dynamic social media platform that lets you share thoughts, follow people, and join the conversation in real time.',
    url: 'https://briza-nine.vercel.app',  
    images: [
      {
        url: '/briza-thumbnail.png',  
        width: 1200,
        height: 627,
        alt: 'Briza Social Media Platform',
      },
    ],
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Briza',
    description: 'Join Briza to share your voice, connect with others, and discover what’s happening right now.',
    images: [
      {
        url: '/briza-thumbnail.png',
        alt: 'Briza Social Media Platform',
      },
    ],
  },
};

export default async  function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lato.className} antialiased w-vw overflow-x-hidden`}
      >
        <TanstackQueryClient>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
           <ConversationSocketUpdate session={session}>
        <ParentRedirect session={session}>
        <main
      className={` w-full `}
    >
            {children}
            
            </main>
            <Sonner />
            <Toaster/>
            
          </ParentRedirect>
          </ConversationSocketUpdate>
          </ThemeProvider>
          </TanstackQueryClient>
      </body>
    </html>
  );
}
