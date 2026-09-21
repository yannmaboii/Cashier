"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Email atau password salah");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("username", data.user.username || "");

      if (data.user.role === "customer") {
        router.push("/akun");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <main className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dekorasi botanical halus */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#4A5D45]" />
        <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-[#4A5D45]" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="mb-9 text-center">
          <Image
            src="/logo-fleur.png"
            alt="Fleur Imperium"
            width={200}
            height={82}
            className="mx-auto mb-5"
            priority
          />
          <p className="text-[#6B6B60] text-sm tracking-wide">
            Masuk untuk melanjutkan
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E2DED2] rounded-2xl p-8 shadow-[0_1px_2px_rgba(43,43,38,0.03),0_20px_40px_-24px_rgba(74,93,69,0.18)]"
        >
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#55564E] uppercase tracking-wide mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@kasir.com"
              className="w-full px-4 py-3 rounded-lg border border-[#E2DED2] bg-[#FAF8F3] text-[#2B2B26] placeholder:text-[#9B9A8E] focus:outline-none focus:ring-2 focus:ring-[#4A5D45]/25 focus:border-[#4A5D45] transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#55564E] uppercase tracking-wide mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-[#E2DED2] bg-[#FAF8F3] text-[#2B2B26] placeholder:text-[#9B9A8E] focus:outline-none focus:ring-2 focus:ring-[#4A5D45]/25 focus:border-[#4A5D45] transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-[#A2461F] font-medium mb-4 -mt-2 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A5D45] hover:bg-[#3E4F3A] active:scale-[0.99] text-[#FAF8F3] font-semibold py-3 rounded-lg shadow-[0_8px_18px_-8px_rgba(74,93,69,0.5)] transition-all disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E2DED2]" />
            <span className="text-[11px] text-[#9B9A8E] font-medium uppercase tracking-wide">
              atau
            </span>
            <div className="flex-1 h-px bg-[#E2DED2]" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#E2DED2] hover:bg-[#F3EFE6] hover:border-[#C9D4C1] text-[#2B2B26] font-medium py-3 rounded-lg transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.33A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58z"
              />
            </svg>
            Masuk dengan Google
          </button>

          <p className="text-center text-sm text-[#6B6B60] mt-6">
            Pelanggan baru?{" "}
            <a href="/register" className="text-[#4A5D45] font-semibold">
              Daftar di sini
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}