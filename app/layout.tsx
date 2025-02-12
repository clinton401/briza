import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import {Lato} from "next/font/google"
import "./globals.css";
import getServerUser from "@/hooks/get-server-user";
import { Toaster } from "@/components/ui/toaster";
import { ParentRedirect } from "@/components/parent-redirect";
import {TanstackQueryClient} from "@/components/tanstack-query-client"
const lato = Lato({ subsets: ["latin"], weight: ["100", "300" , "400"  , "700", "900" ] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
           
        <ParentRedirect session={session}>
        <main
      className={` w-full `}
    >
            {children}
            
            </main>
            <Toaster/>
            
          </ParentRedirect>
          </ThemeProvider>
          </TanstackQueryClient>
      </body>
    </html>
  );
}
