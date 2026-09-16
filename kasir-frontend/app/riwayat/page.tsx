"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type TransaksiItem = {
  id: number;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
  produk: { id: number; nama: string };
};

type Transaksi = {
  id: number;
  kodeTransaksi: string;
  total: number;
  status: string;
  customerEmail: string | null;
  alamatPengiriman: string | null;
  metodePembayaran: string | null;
  createdAt: string;
  items: TransaksiItem[];
};

const statusList = [
  "menunggu_pembayaran",
  "dibayar",
  "diproses",
  "dikirim",
  "selesai",
  "dibatalkan",
];

const statusLabel: Record<string, string> = {
  menunggu_pembayaran: "Menunggu Bayar",
  dibayar: "Dibayar",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const statusColor: Record<string, string> = {
  menunggu_pembayaran: "bg-red-50 text-red-600",
  dibayar: "bg-blue-50 text-blue-600",
  diproses: "bg-amber-50 text-amber-600",
  dikirim: "bg-purple-50 text-purple-600",
  selesai: "bg-green-50 text-green-700",
  dibatalkan: "bg-neutral-100 text-neutral-500",
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
        setTransaksi(data);
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
      if (!res.ok) throw new Error();
      loadTransaksi();
    } catch {
      alert("Gagal menghapus transaksi, coba lagi");
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await authFetch(`/transaksi/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      loadTransaksi();
    } catch {
      alert("Gagal update status, coba lagi");
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
              <div className="flex flex-wrap items-center justify-between gap-2 bg-yellow-50 px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-medium text-neutral-900">
                      {t.kodeTransaksi || `#${t.id}`}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        t.customerEmail
                          ? "bg-purple-50 text-purple-600"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {t.customerEmail ? "Pesanan Online" : "Kasir (Offline)"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {formatTanggal(t.createdAt)}
                    {t.customerEmail ? ` · ${t.customerEmail}` : ""}
                  </p>
                  {t.alamatPengiriman && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      📍 {t.alamatPengiriman}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-neutral-900">
                    Rp {Number(t.total).toLocaleString("id-ID")}
                  </p>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    className={`text-xs px-2 py-1.5 rounded-full border-none font-medium ${statusColor[t.status] || "bg-neutral-100"}`}
                  >
                    {statusList.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel[s]}
                      </option>
                    ))}
                  </select>
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