"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const allMenu = [
  { href: "/", label: "Produk", icon: "📦", roles: ["admin", "gudang"] },
  { href: "/kategori", label: "Kategori", icon: "🏷️", roles: ["admin", "gudang"] },
  { href: "/kasir", label: "Kasir", icon: "🧾", roles: ["admin", "kasir"] },
  { href: "/riwayat", label: "Riwayat Transaksi", icon: "📊", roles: ["admin", "kasir"] },
  { href: "/customer", label: "Customer", icon: "🧑‍🤝‍🧑", roles: ["admin"] },
  { href: "/user", label: "Kelola Staff", icon: "👤", roles: ["admin"] },
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
    <aside className="w-72 p-6 flex flex-col shrink-0 min-h-screen hidden md:flex">
      <div className="flex items-center gap-3.5 px-3 py-2 mb-8">
        <div className="w-12 h-12 rounded-2xl clay-card-yellow flex items-center justify-center text-2xl -rotate-2">
          💰
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
            Kasir Admin
          </h1>
          <p className="text-xs font-medium text-amber-700/70">
            Point of Sales
          </p>
        </div>
      </div>

      <div className="px-4 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Menu
        </span>
      </div>

      <nav className="space-y-2 font-medium text-sm">
        {menu.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={
                "w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-left " +
                (active
                  ? "clay-nav-active font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70")
              }
            >
              <span className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center text-base shadow-inner">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}