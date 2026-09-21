"use client";

import React from "react";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type ItemRekap = {
  produk: string;
  jumlah: number;
  hargaSatuan: number;
  modalSatuan: number;
  subtotal: number;
  untung: number;
};

type TransaksiRekap = {
  id: number;
  kodeTransaksi: string | null;
  createdAt: string;
  status: string;
  ongkosKirim: number;
  items: ItemRekap[];
  pendapatanTransaksi: number;
  modalTransaksi: number;
  untungTransaksi: number;
};

type RekapDana = {
  totalPendapatan: number;
  totalModal: number;
  totalUntung: number;
  transaksi: TransaksiRekap[];
};

const statusLabel: Record<string, string> = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  dibayar: "Sudah Dibayar",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export default function RekapDanaPage() {
  useRoleGuard(["admin"]);

  const [data, setData] = useState<RekapDana | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    authFetch("/transaksi/rekap-dana")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data rekap dana");
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return <p className="text-slate-400">Loading...</p>;
  }

  if (error || !data) {
    return <p className="text-red-500 text-sm">{error || "Gagal memuat data"}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Rekap Dana
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ringkasan pendapatan, modal, dan untung dari transaksi yang sudah
          dibayar.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clay-card-yellow rounded-3xl p-6">
          <span className="text-xs font-bold text-amber-800 tracking-wide uppercase">
            Total Pendapatan
          </span>
          <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Rp {data.totalPendapatan.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="clay-surface rounded-3xl p-6">
          <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
            Total Modal
          </span>
          <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Rp {data.totalModal.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="clay-surface rounded-3xl p-6">
          <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">
            Total Untung
          </span>
          <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 tracking-tight mt-2">
            Rp {data.totalUntung.toLocaleString("id-ID")}
          </div>
        </div>
      </section>

      <section className="clay-surface rounded-3xl overflow-hidden p-3 md:p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 px-2">
          Rincian per Transaksi
        </h2>

        {data.transaksi.length === 0 ? (
          <p className="text-slate-400 text-sm px-2">Belum ada transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-5">Kode Transaksi</th>
                  <th className="py-3 px-5">Tanggal</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Pendapatan</th>
                  <th className="py-3 px-5 text-right">Modal</th>
                  <th className="py-3 px-5 text-right">Untung</th>
                  <th className="py-3 px-5 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-slate-700">
                {data.transaksi.map((t) => (
                 <React.Fragment key={t.id}>
                    <tr
                      key={t.id}
                      className="hover:bg-amber-50/40 rounded-2xl transition-colors"
                    >
                      <td className="py-4 px-5 rounded-l-2xl font-semibold text-slate-900">
                        {t.kodeTransaksi || "-"}
                      </td>
                      <td className="py-4 px-5 text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
                          {statusLabel[t.status] || t.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        Rp {t.pendapatanTransaksi.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-5 text-right">
                        Rp {t.modalTransaksi.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-emerald-600">
                        Rp {t.untungTransaksi.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-5 rounded-r-2xl text-center">
                        <button
                          onClick={() => toggleExpand(t.id)}
                          className="clay-pill-btn px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:text-amber-700"
                        >
                          {expandedId === t.id ? "Tutup" : "Lihat"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === t.id && (
                      <tr>
                        <td colSpan={7} className="px-5 pb-3">
                          <div className="bg-white rounded-2xl border border-slate-100 p-4">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-slate-400 uppercase tracking-wider">
                                  <th className="text-left pb-2">Produk</th>
                                  <th className="text-center pb-2">Jumlah</th>
                                  <th className="text-right pb-2">
                                    Harga Jual
                                  </th>
                                  <th className="text-right pb-2">
                                    Harga Modal
                                  </th>
                                  <th className="text-right pb-2">
                                    Subtotal
                                  </th>
                                  <th className="text-right pb-2">Untung</th>
                                </tr>
                              </thead>
                              <tbody>
                                {t.items.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className="border-t border-slate-50"
                                  >
                                    <td className="py-2 text-slate-800 font-medium">
                                      {item.produk}
                                    </td>
                                    <td className="py-2 text-center">
                                      {item.jumlah}
                                    </td>
                                    <td className="py-2 text-right">
                                      Rp{" "}
                                      {item.hargaSatuan.toLocaleString(
                                        "id-ID"
                                      )}
                                    </td>
                                    <td className="py-2 text-right">
                                      Rp{" "}
                                      {item.modalSatuan.toLocaleString(
                                        "id-ID"
                                      )}
                                    </td>
                                    <td className="py-2 text-right">
                                      Rp {item.subtotal.toLocaleString("id-ID")}
                                    </td>
                                    <td className="py-2 text-right font-semibold text-emerald-600">
                                      Rp {item.untung.toLocaleString("id-ID")}
                                    </td>
                                  </tr>
                                ))}
                                {t.ongkosKirim > 0 && (
                                  <tr className="border-t border-slate-50">
                                    <td
                                      className="py-2 text-slate-500 italic"
                                      colSpan={4}
                                    >
                                      Ongkos Kirim
                                    </td>
                                    <td
                                      className="py-2 text-right text-slate-500 italic"
                                      colSpan={2}
                                    >
                                      Rp {t.ongkosKirim.toLocaleString("id-ID")}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}