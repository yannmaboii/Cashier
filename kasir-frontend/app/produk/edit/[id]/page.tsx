"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

export default function EditProduk() {
  useRoleGuard(["admin", "gudang"]);

  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");
  const [kategori, setKategori] = useState("");
  const [fotoLama, setFotoLama] = useState<string | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    fetch(`http://localhost:3000/produk/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setNama(data.nama);
        setHarga(String(data.harga));
        setStok(String(data.stok));
        setKategori(data.kategori || "");
        setFotoLama(data.foto || null);
        setFetching(false);
      })
      .catch(() => {
        setError("Gagal memuat data produk");
        setFetching(false);
      });
  }, [id]);

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
      const res = await authFetch(`/produk/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nama,
          harga: Number(harga),
          stok: Number(stok),
          kategori,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan perubahan");
      }

      if (foto) {
        const formData = new FormData();
        formData.append("foto", foto);
        await authFetch(`/produk/${id}/foto`, {
          method: "POST",
          body: formData,
        });
      }

      router.push("/");
    } catch (err) {
      setError("Gagal menyimpan perubahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-slate-400">Loading...</p>;
  }

  const tampilkanFoto = preview || (fotoLama ? `http://localhost:3000${fotoLama}` : null);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-slate-900 mb-6">
          Edit Produk
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
                {tampilkanFoto ? (
                  <img
                    src={tampilkanFoto}
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
              Harga
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
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}