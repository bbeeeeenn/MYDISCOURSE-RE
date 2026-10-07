import { SidebarProvider } from "@/components/SidebarProvider";
import { Suspense } from "react";

export default function Layout({
   children,
   login,
}: Readonly<{ children: React.ReactNode; login: React.ReactNode }>) {
   return (
      <Suspense>
         <SidebarProvider>
            {login}
            {children}
         </SidebarProvider>
      </Suspense>
   );
}
