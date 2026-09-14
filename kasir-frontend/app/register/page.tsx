"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
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
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Gagal mendaftar");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      router.push("/akun");
    } catch (err: any) {
      setError(err.message || "Gagal mendaftar, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-300 shadow-lg shadow-yellow-200 mb-4">
            <span className="text-4xl">🙋</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-800">
            Daftar Akun
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Buat akun pelanggan baru
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-yellow-100 rounded-[2rem] p-7 shadow-xl shadow-yellow-100/50"
        >
          <div className="mb-4">
            <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="kamu@email.com"
              className="w-full px-4 py-3 rounded-full border-2 border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-yellow-300 transition-all"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-full border-2 border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-yellow-200 focus:border-yellow-300 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium mb-4 -mt-1 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-300 hover:bg-yellow-400 active:scale-95 text-neutral-900 font-bold py-3 rounded-full shadow-md shadow-yellow-200 transition-all disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Daftar 🎉"}
          </button>

          <p className="text-center text-sm text-neutral-500 mt-4">
            Sudah punya akun?{" "}
            <a href="/login" className="text-yellow-600 font-semibold">
              Masuk di sini
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}