import { SidebarProvider } from "@/components/SidebarProvider";
import { roomsPage } from "@/constants";
import { DoorOpen } from "lucide-react";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
