"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

export default function TambahKategori() {
  useRoleGuard(["admin", "gudang"]);

  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authFetch("/kategori", {
        method: "POST",
        body: JSON.stringify({ nama, deskripsi }),
      });

      if (!res.ok) {
        throw new Error("Gagal menambah kategori");
      }

      router.push("/kategori");
    } catch (err) {
      setError("Gagal menambah kategori, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-neutral-900 mb-6">
          Tambah Kategori
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nama Kategori
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          {error && <p className="text-sm text-red-600 mb-4 -mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Kategori"}
          </button>
        </form>
      </div>
    </div>
  );
}