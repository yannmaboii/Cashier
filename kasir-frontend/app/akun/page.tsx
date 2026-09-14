"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AkunPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setEmail(localStorage.getItem("email") || "");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-300 shadow-lg shadow-yellow-200 mb-4">
          <span className="text-4xl">👋</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 mb-1">
          Halo, {email}!
        </h1>
        <p className="text-neutral-500 text-sm mb-6">
          Selamat datang di akun pelanggan kamu
        </p>

        <button
          onClick={handleLogout}
          className="bg-white border-2 border-neutral-200 hover:border-red-300 hover:text-red-500 text-neutral-600 font-medium px-6 py-2.5 rounded-full transition-all"
        >
          Keluar
        </button>
      </div>
    </main>
  );
}