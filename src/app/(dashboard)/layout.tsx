import { SidebarProvider } from "@/components/SidebarProvider";
import { Suspense } from "react";

export default function Layout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return (
      <Suspense fallback={null}>
         <SidebarProvider>{children}</SidebarProvider>
      </Suspense>
   );
}
