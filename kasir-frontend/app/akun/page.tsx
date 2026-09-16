"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";

type Pesanan = {
  id: number;
  kodeTransaksi: string;
  total: number;
  status: string;
  createdAt: string;
  items: { id: number; jumlah: number; produk: { nama: string } }[];
};

const statusLabel: Record<string, string> = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  dibayar: "Sudah Dibayar",
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

export default function AkunPage() {
  const [username, setUsername] = useState("");
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadPesanan = () => {
    authFetch("/transaksi/saya")
      .then((res) => res.json())
      .then((data) => {
        setPesanan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setUsername(
      localStorage.getItem("username") || localStorage.getItem("email") || "",
    );
    loadPesanan();
  }, [router]);

  const handleBayar = async (id: number) => {
    try {
      const res = await authFetch(`/transaksi/${id}/bayar`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      loadPesanan();
    } catch {
      alert("Gagal memproses pembayaran, coba lagi");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Halo, {username}! 👋
            </h1>
            <p className="text-neutral-500 text-sm">
              Selamat datang di akun pelanggan kamu
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white border-2 border-neutral-200 hover:border-red-300 hover:text-red-500 text-neutral-600 font-medium px-5 py-2 rounded-full transition-all"
          >
            Keluar
          </button>
        </div>

        <a
          href="/akun/belanja"
          className="block text-center bg-yellow-300 hover:bg-yellow-400 active:scale-95 text-neutral-900 font-bold py-3 rounded-full shadow-md shadow-yellow-200 transition-all mb-8"
        >
          🛒 Belanja Sekarang
        </a>

        <h2 className="text-lg font-semibold text-neutral-800 mb-3">
          Pesanan Saya
        </h2>

        {loading ? (
          <p className="text-neutral-400 text-sm">Loading...</p>
        ) : pesanan.length === 0 ? (
          <p className="text-neutral-400 text-sm">Belum ada pesanan.</p>
        ) : (
          <div className="space-y-3">
            {pesanan.map((p) => (
              <div
                key={p.id}
                className="bg-white border-2 border-yellow-100 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-mono text-neutral-500">
                      {p.kodeTransaksi}
                    </p>
                    <p className="font-semibold text-neutral-900">
                      Rp {Number(p.total).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[p.status] || "bg-neutral-100"}`}
                  >
                    {statusLabel[p.status] || p.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 mb-2">
                  {p.items.map((i) => `${i.produk.nama} x${i.jumlah}`).join(", ")}
                </p>

                {p.status === "menunggu_pembayaran" && (
                  <button
                    onClick={() => handleBayar(p.id)}
                    className="w-full bg-yellow-300 hover:bg-yellow-400 text-neutral-900 font-semibold py-2 rounded-full text-sm transition-all"
                  >
                    Bayar Sekarang (Simulasi)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}