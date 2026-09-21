"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/api";

type TransaksiItem = {
  id: number;
  jumlah: number;
  produk: { nama: string };
};

type Transaksi = {
  id: number;
  kodeTransaksi: string;
  total: number;
  status: string;
  customerEmail: string | null;
  alamatPengiriman: string | null;
  ongkosKirim: number | null;
  kurir: string | null;
  createdAt: string;
  items: TransaksiItem[];
};

export default function CetakResiPage() {
  const params = useParams();
  const id = params.id;

  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch(`/transaksi/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setTransaksi(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data transaksi");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (transaksi) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [transaksi]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-400 text-sm">Memuat resi...</p>
      </div>
    );
  }

  if (error || !transaksi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500 text-sm">
          {error || "Transaksi tidak ditemukan"}
        </p>
      </div>
    );
  }

  const formatTanggal = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-md mx-auto bg-white border-2 border-neutral-900 rounded-lg overflow-hidden print:border-2 print:rounded-none">
        {/* Header */}
        <div className="border-b-2 border-dashed border-neutral-900 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-lg tracking-tight">
              Fleur Imperium
            </p>
            <p className="text-xs text-neutral-500">Label Pengiriman</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">
              Kode Transaksi
            </p>
            <p className="font-mono font-bold text-sm">
              {transaksi.kodeTransaksi}
            </p>
          </div>
        </div>

        {/* Pengirim & Penerima */}
        <div className="grid grid-cols-2 border-b-2 border-dashed border-neutral-900">
          <div className="px-5 py-4 border-r border-neutral-200">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-bold mb-1">
              Pengirim
            </p>
            <p className="font-bold text-sm">Fleur Imperium</p>
            <p className="text-xs text-neutral-600 mt-0.5">
              Bogor, Jawa Barat
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-bold mb-1">
              Penerima
            </p>
            <p className="font-bold text-sm">
              {transaksi.customerEmail || "-"}
            </p>
            <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
              {transaksi.alamatPengiriman || "-"}
            </p>
          </div>
        </div>

        {/* Kurir */}
        <div className="px-5 py-3 border-b-2 border-dashed border-neutral-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-bold">
              Kurir / Layanan
            </p>
            <p className="font-bold text-sm">{transaksi.kurir || "-"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-bold">
              Tanggal
            </p>
            <p className="text-sm font-medium">
              {formatTanggal(transaksi.createdAt)}
            </p>
          </div>
        </div>

        {/* Daftar barang */}
        <div className="px-5 py-4">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-bold mb-2">
            Isi Paket
          </p>
          <div className="space-y-1">
            {transaksi.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-neutral-800"
              >
                <span>{item.produk?.nama || "Produk"}</span>
                <span className="font-semibold">x{item.jumlah}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-900 text-white text-center">
          <p className="text-xs font-medium">
            Terima kasih sudah belanja di Fleur Imperium 🌷
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto mt-4 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-neutral-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-neutral-800 transition-all"
        >
          🖨️ Print Ulang
        </button>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A6;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}