"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const proses = async () => {
      try {
        const res = await fetch("http://localhost:3000/customer/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.setItem("token", token);
        localStorage.setItem("role", "customer");

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("email", data.email || "");
          localStorage.setItem("username", data.nama || "");
        }

        router.push("/akun");
      } catch {
        localStorage.setItem("token", token);
        localStorage.setItem("role", "customer");
        router.push("/akun");
      }
    };

    proses();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-300 shadow-lg shadow-yellow-200 mb-4 animate-pulse">
          <span className="text-3xl">🌷</span>
        </div>
        <p className="text-neutral-600 font-medium">Sedang masuk...</p>
      </div>
    </main>
  );
}