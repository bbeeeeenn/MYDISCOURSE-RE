import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import clsx from "clsx";
import { ToastContainer } from "react-toastify";
import { Outfit } from "next/font/google";

const outfitFont = Outfit({
   variable: "--font-outfit",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "MyDiscourse",
   description: "Your platform for meaningful discussions and connections.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
   return (
      <html
         lang="en"
         className={clsx("h-full antialiased", outfitFont.variable)}
      >
         <body className="bg-base-100 font-outfit flex min-h-full flex-col select-none">
            <ToastContainer
               toastClassName={"select-none"}
               position="bottom-right"
            />
            <AuthSessionProvider>{children}</AuthSessionProvider>
         </body>
      </html>
   );
}
