"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Topbar from "./Topbar";

export default function ShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const noShell =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/akun");

  if (noShell) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}