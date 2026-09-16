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

type CartItem = {
  produkId: number;
  nama: string;
  harga: number;
  jumlah: number;
  stokTersedia: number;
};

export default function KasirPage() {
  useRoleGuard(["admin", "kasir"]);

  const [produk, setProduk] = useState<Produk[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const tambahKeCart = (p: Produk) => {
    setError("");
    setCart((prev) => {
      const existing = prev.find((item) => item.produkId === p.id);
      if (existing) {
        if (existing.jumlah + 1 > p.stok) {
          setError(`Stok ${p.nama} tidak cukup`);
          return prev;
        }
        return prev.map((item) =>
          item.produkId === p.id
            ? { ...item, jumlah: item.jumlah + 1 }
            : item,
        );
      }
      if (p.stok < 1) {
        setError(`Stok ${p.nama} habis`);
        return prev;
      }
      return [
        ...prev,
        {
          produkId: p.id,
          nama: p.nama,
          harga: Number(p.harga),
          jumlah: 1,
          stokTersedia: p.stok,
        },
      ];
    });
  };

  const ubahJumlah = (produkId: number, delta: number) => {
    setError("");
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.produkId !== produkId) return item;
          const jumlahBaru = item.jumlah + delta;
          if (jumlahBaru > item.stokTersedia) {
            setError(`Stok ${item.nama} tidak cukup`);
            return item;
          }
          return { ...item, jumlah: jumlahBaru };
        })
        .filter((item) => item.jumlah > 0),
    );
  };

  const hapusDariCart = (produkId: number) => {
    setCart((prev) => prev.filter((item) => item.produkId !== produkId));
  };

  const total = cart.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

  const handleProses = async () => {
    if (cart.length === 0) return;
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      const res = await authFetch("/transaksi", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((item) => ({
            produkId: item.produkId,
            jumlah: item.jumlah,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Gagal memproses transaksi");
      }

      setCart([]);
      setSuccess("Transaksi berhasil diproses!");
      loadProduk();
    } catch (err: any) {
      setError(err.message || "Gagal memproses transaksi");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <p className="text-slate-400">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-4">Kasir</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {produk.map((p) => (
              <button
                key={p.id}
                onClick={() => tambahKeCart(p)}
                disabled={p.stok < 1}
                className="clay-pill-btn text-left rounded-2xl p-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-full aspect-square rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center mb-2">
                  {p.foto ? (
                    <img
                      src={`http://localhost:3000${p.foto}`}
                      alt={p.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>
                <p className="font-semibold text-slate-900 text-sm">
                  {p.nama}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rp {Number(p.harga).toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Stok: {p.stok}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="clay-surface rounded-3xl p-5 h-fit sticky top-4">
          <h2 className="font-bold text-slate-900 mb-4">Keranjang</h2>

          {cart.length === 0 ? (
            <p className="text-sm text-slate-400">
              Belum ada produk dipilih
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div
                  key={item.produkId}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.nama}
                    </p>
                    <p className="text-xs text-slate-500">
                      Rp {item.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => ubahJumlah(item.produkId, -1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      −
                    </button>
                    <span className="text-sm w-5 text-center">
                      {item.jumlah}
                    </span>
                    <button
                      onClick={() => ubahJumlah(item.produkId, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => hapusDariCart(item.produkId)}
                    className="text-xs text-red-500 hover:text-red-700 ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-200 pt-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Total
              </span>
              <span className="text-lg font-bold text-slate-900">
                Rp {total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600 mb-3">{success}</p>
          )}

          <button
            onClick={handleProses}
            disabled={cart.length === 0 || processing}
            className="clay-btn-gold w-full text-white font-bold py-2.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Memproses..." : "Proses Transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}