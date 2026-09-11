"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

const roleLabel: Record<string, string> = {
  admin: "Admin",
  kasir: "Staff Kasir",
  gudang: "Staff Gudang",
};

const roleEmoji: Record<string, string> = {
  admin: "👑",
  kasir: "🧾",
  gudang: "📦",
};

export default function Topbar() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    setEmail(localStorage.getItem("email") || "");
    setRole(localStorage.getItem("role") || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between bg-white/90 backdrop-blur px-5 py-3 m-3 rounded-full border-2 border-yellow-100 shadow-sm">
      <SidebarTrigger className="rounded-full" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-yellow-50 rounded-full px-3 py-1.5">
          <span>{roleEmoji[role] || "🙂"}</span>
          <div className="text-right">
            <p className="text-xs font-semibold text-neutral-800 leading-tight">
              {email}
            </p>
            <p className="text-[10px] text-neutral-500 leading-tight">
              {roleLabel[role] || role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-500 hover:text-white hover:bg-red-400 border-2 border-neutral-200 hover:border-red-400 rounded-full px-4 py-1.5 transition-all"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}