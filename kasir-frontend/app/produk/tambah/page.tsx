"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

export default function TambahProduk() {
  useRoleGuard(["admin", "gudang"]);

  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [hargaModal, setHargaModal] = useState("");
  const [stok, setStok] = useState("");
  const [kategori, setKategori] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authFetch("/produk", {
        method: "POST",
        body: JSON.stringify({
          nama,
          harga: Number(harga),
          hargaModal: hargaModal ? Number(hargaModal) : undefined,
          stok: Number(stok),
          kategori,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menambah produk");
      }

      const data = await res.json();

      if (foto) {
        const formData = new FormData();
        formData.append("foto", foto);
        await authFetch(`/produk/${data.id}/foto`, {
          method: "POST",
          body: formData,
        });
      }

      router.push("/");
    } catch (err) {
      setError("Gagal menambah produk, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-slate-900 mb-6">
          Tambah Produk
        </h1>

        <form
          onSubmit={handleSubmit}
          className="clay-surface rounded-3xl p-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Foto Produk
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFotoChange}
                className="text-xs text-slate-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Nama Produk
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Harga Jual
            </label>
            <input
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Harga Modal
            </label>
            <input
              type="number"
              value={hargaModal}
              onChange={(e) => setHargaModal(e.target.value)}
              placeholder="Opsional, buat hitung untung di Rekap Dana"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Stok
            </label>
            <input
              type="number"
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Kategori
            </label>
            <input
              type="text"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>

          {error && <p className="text-sm text-red-500 mb-4 -mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="clay-btn-gold w-full text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </div>
    </div>
  );
}