"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const roleLabel: Record<string, string> = {
  admin: "Admin",
  kasir: "Staff Kasir",
  gudang: "Staff Gudang",
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
    <header className="flex items-center justify-between px-8 py-5">
      <div />
      <div className="flex items-center gap-4">
        <div className="clay-surface px-4 py-2 rounded-2xl flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {email}
            </p>
            <p className="text-[10px] text-amber-700/70 leading-tight">
              {roleLabel[role] || role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="clay-pill-btn px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-red-600 border border-slate-200/70"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}