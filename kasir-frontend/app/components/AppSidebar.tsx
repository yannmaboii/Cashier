"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const allMenu = [
  { href: "/", label: "Produk", icon: "📦", roles: ["admin", "gudang"] },
  { href: "/kategori", label: "Kategori", icon: "🏷️", roles: ["admin", "gudang"] },
  { href: "/kasir", label: "Kasir", icon: "🧾", roles: ["admin", "kasir"] },
  { href: "/riwayat", label: "Riwayat Transaksi", icon: "📊", roles: ["admin", "kasir"] },
  { href: "/customer", label: "Customer", icon: "🧑‍🤝‍🧑", roles: ["admin"] },
  { href: "/user", label: "Kelola User", icon: "👤", roles: ["admin"] },
  { href: "/role", label: "Kelola Role", icon: "🔑", roles: ["admin"] },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  const menu = allMenu.filter((item) => !role || item.roles.includes(role));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="text-lg">💰</span>
          <span className="font-semibold text-neutral-900">Kasir Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    onClick={() => router.push(item.href)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}