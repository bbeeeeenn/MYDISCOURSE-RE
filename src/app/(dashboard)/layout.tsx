import { SidebarProvider } from "@/components/SidebarProvider";

export default function Layout({
   children,
}: Readonly<{ children: React.ReactNode }>) {
   return <SidebarProvider>{children}</SidebarProvider>;
}
