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
      .catch((err) => {
        console.error("Gagal fetch produk:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProduk();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    const konfirmasi = confirm(`Yakin mau hapus "${nama}"?`);
    if (!konfirmasi) return;

    try {
      const res = await authFetch(`/produk/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus produk");
      loadProduk();
    } catch (err) {
      alert("Gagal menghapus produk, coba lagi");
    }
  };

  if (loading) {
    return <p className="text-neutral-400">Loading...</p>;
  }

  const totalStok = produk.reduce((sum, p) => sum + Number(p.stok), 0);
  const totalNilai = produk.reduce(
    (sum, p) => sum + Number(p.harga) * Number(p.stok),
    0,
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-xs text-neutral-500">Jumlah Produk</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">
            {produk.length}
          </p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <p className="text-xs text-neutral-500">Total Stok</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">
            {totalStok}
          </p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <p className="text-xs text-neutral-500">Estimasi Nilai Stok</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">
            Rp {totalNilai.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-neutral-900">
          Daftar Produk
        </h1>
        <a
          href="/produk/tambah"
          className="text-sm bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-medium rounded-lg px-4 py-2"
        >
          + Tambah Produk
        </a>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-neutral-500">
              <th className="text-left font-medium px-4 py-3">Nama</th>
              <th className="text-left font-medium px-4 py-3">Harga</th>
              <th className="text-left font-medium px-4 py-3">Stok</th>
              <th className="text-left font-medium px-4 py-3">Kategori</th>
              <th className="text-left font-medium px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produk.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 text-neutral-800 font-medium">
                  {p.nama}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  Rp {Number(p.harga).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "text-xs px-2 py-1 rounded-full " +
                      (Number(p.stok) < 5
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-700")
                    }
                  >
                    {p.stok}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500">{p.kategori}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a
                      href={`/produk/edit/${p.id}`}
                      className="text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-300 rounded-lg px-3 py-1.5"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(p.id, p.nama)}
                      className="text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5"
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
  );
}