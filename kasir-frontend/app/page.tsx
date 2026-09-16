"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type Produk = {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  kategori: string;
  foto: string | null;
};

export default function Home() {
  useRoleGuard(["admin", "gudang"]);

  const [produk, setProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProduk = () => {
    fetch("http://localhost:3000/produk")
      .then((res) => res.json())
      .then((data) => {
        setProduk(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProduk();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    const konfirmasi = confirm(`Yakin mau hapus "${nama}"?`);
    if (!konfirmasi) return;

    try {
      const res = await authFetch(`/produk/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      loadProduk();
    } catch {
      alert("Gagal menghapus produk, coba lagi");
    }
  };

  if (loading) {
    return <p className="text-slate-400">Loading...</p>;
  }

  const totalStok = produk.reduce((sum, p) => sum + Number(p.stok), 0);
  const totalNilai = produk.reduce(
    (sum, p) => sum + Number(p.harga) * Number(p.stok),
    0,
  );

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clay-card-yellow rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-amber-800 tracking-wide uppercase">
              Jumlah Produk
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-200/50 flex items-center justify-center text-sm shadow-inner">
              📦
            </span>
          </div>
          <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {produk.length}
          </div>
          <p className="text-xs text-amber-700/80 font-medium mt-2">
            Item terdaftar aktif
          </p>
        </div>

        <div className="clay-surface rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
              Total Stok
            </span>
            <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm shadow-inner">
              📈
            </span>
          </div>
          <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {totalStok}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Unit siap dipasarkan
          </p>
        </div>

        <div className="clay-surface rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
              Estimasi Nilai Stok
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-100/60 flex items-center justify-center text-sm shadow-inner">
              💵
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Rp {totalNilai.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">
            Perhitungan inventaris realtime
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Daftar Produk
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data inventaris, penyesuaian harga, dan stok kasir.
            </p>
          </div>
          <a
            href="/produk/tambah"
            className="clay-btn-gold text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center gap-2 tracking-wide"
          >
            <span>+</span>
            <span>Tambah Produk</span>
          </a>
        </div>

        <div className="clay-surface rounded-3xl overflow-hidden p-3 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-5">Produk</th>
                  <th className="py-3 px-5">Harga</th>
                  <th className="py-3 px-5 text-center">Stok</th>
                  <th className="py-3 px-5">Kategori</th>
                  <th className="py-3 px-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-slate-700">
                {produk.map((p) => (
                  <tr
                    key={p.id}
                    className="group hover:bg-amber-50/40 rounded-2xl transition-colors"
                  >
                    <td className="py-4 px-5 rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                          {p.foto ? (
                            <img
                              src={`http://localhost:3000${p.foto}`}
                              alt={p.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {p.nama}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-800">
                      Rp {Number(p.harga).toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="clay-badge-mint font-bold px-3.5 py-1 rounded-full text-xs inline-block">
                        {p.stok}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
                        {p.kategori}
                      </span>
                    </td>
                    <td className="py-4 px-5 rounded-r-2xl text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`/produk/edit/${p.id}`}
                          className="clay-pill-btn px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:text-amber-700"
                        >
                          Edit
                        </a>
                        <button
                          onClick={() => handleDelete(p.id, p.nama)}
                          className="clay-pill-red px-4 py-1.5 rounded-xl text-xs font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}