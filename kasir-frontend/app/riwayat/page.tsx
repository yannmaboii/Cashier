"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type TransaksiItem = {
  id: number;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
  produk: {
    id: number;
    nama: string;
  };
};

type Transaksi = {
  id: number;
  total: number;
  createdAt: string;
  items: TransaksiItem[];
};

export default function RiwayatPage() {
  useRoleGuard(["admin", "kasir"]);

  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);

  const loadTransaksi = () => {
    authFetch("/transaksi")
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setTransaksi(sorted);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat riwayat transaksi");
        setLoading(false);
      });
  };

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    loadTransaksi();
  }, []);

  const handleDelete = async (id: number) => {
    const konfirmasi = confirm(`Yakin mau hapus Transaksi #${id}?`);
    if (!konfirmasi) return;

    try {
      const res = await authFetch(`/transaksi/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus transaksi");
      loadTransaksi();
    } catch (err) {
      alert("Gagal menghapus transaksi, coba lagi");
    }
  };

  const formatTanggal = (iso: string) => {
    const tanggal = new Date(iso);
    return tanggal.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <p className="text-neutral-400">Loading...</p>;
  }

  const totalPendapatan = transaksi.reduce(
    (sum, t) => sum + Number(t.total),
    0,
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-xs text-neutral-500">Jumlah Transaksi</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">
            {transaksi.length}
          </p>
        </div>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
          <p className="text-xs text-neutral-500">Total Pendapatan</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1">
            Rp {totalPendapatan.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <h1 className="text-xl font-semibold text-neutral-900 mb-4">
        Riwayat Transaksi
      </h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {transaksi.length === 0 ? (
        <p className="text-neutral-400 text-sm">Belum ada transaksi.</p>
      ) : (
        <div className="space-y-4">
          {transaksi.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between bg-yellow-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Transaksi #{t.id}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatTanggal(t.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-base font-semibold text-neutral-900">
                    Rp {Number(t.total).toLocaleString("id-ID")}
                  </p>
                  {role === "admin" && (
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-neutral-500">
                    <th className="text-left font-medium px-4 py-2">
                      Produk
                    </th>
                    <th className="text-right font-medium px-4 py-2">
                      Jumlah
                    </th>
                    <th className="text-right font-medium px-4 py-2">
                      Harga Satuan
                    </th>
                    <th className="text-right font-medium px-4 py-2">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.items.map((item) => (
                    <tr key={item.id} className="border-t border-neutral-100">
                      <td className="px-4 py-2 text-neutral-800">
                        {item.produk?.nama || "Produk tidak ditemukan"}
                      </td>
                      <td className="px-4 py-2 text-right text-neutral-800">
                        {item.jumlah}
                      </td>
                      <td className="px-4 py-2 text-right text-neutral-800">
                        Rp {Number(item.hargaSatuan).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2 text-right text-neutral-800">
                        Rp {Number(item.subtotal).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}