import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import {Lato} from "next/font/google"
import "./globals.css";

const lato = Lato({ subsets: ["latin"], weight: ["100", "300" , "400"  , "700", "900" ] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default  function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lato.className} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}