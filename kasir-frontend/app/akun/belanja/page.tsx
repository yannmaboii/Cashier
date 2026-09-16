"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";

// TODO: ganti kalau lokasi asal toko berubah
const ORIGIN_ID = 8301; // Laladon, Ciomas, Bogor, Jawa Barat

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

type Destinasi = {
  id: number;
  label: string;
};

type OngkirOption = {
  name: string;
  service: string;
  description?: string;
  cost: number;
  etd?: string;
};

const kurirList = [
  { code: "jne", label: "JNE" },
  { code: "jnt", label: "J&T Express" },
  { code: "sicepat", label: "SiCepat" },
  { code: "pos", label: "Pos Indonesia" },
  { code: "tiki", label: "TIKI" },
  { code: "anteraja", label: "AnterAja" },
];

export default function BelanjaPage() {
  const [produk, setProduk] = useState<Produk[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [alamat, setAlamat] = useState("");
  const [metode, setMetode] = useState("Transfer Bank (Midtrans)");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Ongkir
  const [cariTujuan, setCariTujuan] = useState("");
  const [hasilTujuan, setHasilTujuan] = useState<Destinasi[]>([]);
  const [tujuan, setTujuan] = useState<Destinasi | null>(null);
  const [kurir, setKurir] = useState("jne");
  const [opsiOngkir, setOpsiOngkir] = useState<OngkirOption[]>([]);
  const [ongkirTerpilih, setOngkirTerpilih] = useState<OngkirOption | null>(
    null,
  );
  const [cariLoading, setCariLoading] = useState(false);
  const [ongkirLoading, setOngkirLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:3000/produk")
      .then((res) => res.json())
      .then((data) => {
        setProduk(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

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
    setCart((prev) =>
      prev
        .map((item) =>
          item.produkId === produkId
            ? { ...item, jumlah: item.jumlah + delta }
            : item,
        )
        .filter((item) => item.jumlah > 0),
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.harga * item.jumlah,
    0,
  );
  const totalBerat = cart.reduce((sum, item) => sum + item.jumlah * 500, 0); // estimasi 500gr/item
  const grandTotal = subtotal + (ongkirTerpilih?.cost || 0);

  const handleCariTujuan = async () => {
    if (!cariTujuan.trim()) return;
    setCariLoading(true);
    setHasilTujuan([]);
    try {
      const res = await fetch(
        `http://localhost:3000/ongkir/destinasi?search=${encodeURIComponent(cariTujuan)}`,
      );
      const data = await res.json();
      setHasilTujuan(data.data || data || []);
    } catch {
      setError("Gagal mencari lokasi tujuan");
    } finally {
      setCariLoading(false);
    }
  };

  const handleCekOngkir = async () => {
    if (!tujuan) {
      setError("Pilih dulu lokasi tujuan pengiriman");
      return;
    }
    if (cart.length === 0) {
      setError("Keranjang masih kosong");
      return;
    }

    setError("");
    setOngkirLoading(true);
    setOpsiOngkir([]);
    setOngkirTerpilih(null);

    try {
      const res = await fetch("http://localhost:3000/ongkir/cek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: ORIGIN_ID,
          destination: tujuan.id,
          weight: totalBerat,
          courier: kurir,
          price: "lowest",
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setOpsiOngkir(data.data || data || []);
    } catch {
      setError("Gagal menghitung ongkos kirim");
    } finally {
      setOngkirLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!alamat.trim()) {
      setError("Alamat lengkap wajib diisi");
      return;
    }
    if (!ongkirTerpilih) {
      setError("Pilih dulu opsi pengiriman");
      return;
    }

    setError("");
    setProcessing(true);

    try {
      const res = await authFetch("/transaksi", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((item) => ({
            produkId: item.produkId,
            jumlah: item.jumlah,
          })),
          alamatPengiriman: `${alamat} (${tujuan?.label})`,
          metodePembayaran: metode,
          ongkosKirim: ongkirTerpilih.cost,
          kurir: `${ongkirTerpilih.name} ${ongkirTerpilih.service}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Gagal membuat pesanan");
      }

      const transaksi = await res.json();

      if (metode === "Bayar di Tempat (COD)") {
        router.push("/akun");
        return;
      }

      const bayarRes = await authFetch("/pembayaran/buat", {
        method: "POST",
        body: JSON.stringify({
          orderId: transaksi.kodeTransaksi,
          grossAmount: grandTotal,
          customerName:
            localStorage.getItem("username") ||
            localStorage.getItem("email") ||
            "Customer",
          customerEmail: localStorage.getItem("email") || undefined,
        }),
      });

      if (!bayarRes.ok) {
        throw new Error(
          "Pesanan dibuat, tapi gagal membuka halaman pembayaran. Cek di Pesanan Saya.",
        );
      }

      const bayarData = await bayarRes.json();

      if (bayarData.redirect_url) {
        window.location.href = bayarData.redirect_url;
      } else {
        router.push("/akun");
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat pesanan");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-8">
        <p className="text-neutral-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        <a href="/akun" className="text-sm text-neutral-500 mb-2 inline-block">
          ← Kembali ke Akun
        </a>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">
          🛒 Belanja
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produk */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            {produk.map((p) => (
              <button
                key={p.id}
                onClick={() => tambahKeCart(p)}
                disabled={p.stok < 1}
                className="text-left bg-white border-2 border-yellow-100 rounded-2xl p-3 shadow-sm hover:border-yellow-300 hover:shadow-md transition-all disabled:opacity-40"
              >
                <div className="w-full aspect-square rounded-xl bg-yellow-50 overflow-hidden flex items-center justify-center mb-2">
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
                <p className="font-medium text-neutral-900 text-sm">
                  {p.nama}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Rp {Number(p.harga).toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Stok: {p.stok}
                </p>
              </button>
            ))}
          </div>

          {/* Keranjang + Pengiriman */}
          <div className="bg-white border-2 border-yellow-100 rounded-2xl p-5 h-fit shadow-sm space-y-4">
            <div>
              <h2 className="font-semibold text-neutral-900 mb-2">
                Keranjang
              </h2>
              {cart.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  Belum ada produk dipilih
                </p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.produkId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-neutral-800 truncate">
                        {item.nama}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => ubahJumlah(item.produkId, -1)}
                          className="w-6 h-6 rounded-full border border-neutral-300"
                        >
                          −
                        </button>
                        <span className="w-4 text-center">{item.jumlah}</span>
                        <button
                          onClick={() => ubahJumlah(item.produkId, 1)}
                          className="w-6 h-6 rounded-full border border-neutral-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Alamat Lengkap (nama jalan, no. rumah, dll)
              </label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                rows={2}
                placeholder="Jl. Contoh No. 123, RT/RW..."
                className="w-full px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300"
              />
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Cari Kecamatan Tujuan
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={cariTujuan}
                  onChange={(e) => setCariTujuan(e.target.value)}
                  placeholder="misal: Dramaga"
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300"
                />
                <button
                  onClick={handleCariTujuan}
                  disabled={cariLoading}
                  className="text-xs bg-neutral-800 text-white px-3 rounded-xl font-medium"
                >
                  {cariLoading ? "..." : "Cari"}
                </button>
              </div>

              {hasilTujuan.length > 0 && (
                <div className="border border-neutral-200 rounded-xl max-h-32 overflow-y-auto mb-2">
                  {hasilTujuan.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setTujuan(d);
                        setHasilTujuan([]);
                        setCariTujuan(d.label);
                        setOpsiOngkir([]);
                        setOngkirTerpilih(null);
                      }}
                      className="w-full text-left text-xs px-3 py-2 hover:bg-yellow-50 border-b border-neutral-100 last:border-0"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}

              {tujuan && (
                <p className="text-xs text-emerald-600 mb-2">
                  ✓ Tujuan: {tujuan.label}
                </p>
              )}

              <select
                value={kurir}
                onChange={(e) => setKurir(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm mb-2 focus:outline-none focus:border-yellow-300"
              >
                {kurirList.map((k) => (
                  <option key={k.code} value={k.code}>
                    {k.label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCekOngkir}
                disabled={!tujuan || ongkirLoading}
                className="w-full text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold py-2 rounded-xl transition-all disabled:opacity-50"
              >
                {ongkirLoading ? "Menghitung..." : "Cek Ongkos Kirim"}
              </button>

              {opsiOngkir.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {opsiOngkir.map((o, i) => (
                    <button
                      key={i}
                      onClick={() => setOngkirTerpilih(o)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-xl border-2 transition-all ${
                        ongkirTerpilih === o
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-neutral-200"
                      }`}
                    >
                      <div className="flex justify-between font-semibold text-neutral-800">
                        <span>
                          {o.name} {o.service}
                        </span>
                        <span>Rp {Number(o.cost).toLocaleString("id-ID")}</span>
                      </div>
                      {o.etd && (
                        <p className="text-neutral-400">Estimasi {o.etd} hari</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={metode}
                onChange={(e) => setMetode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300"
              >
                <option>Transfer Bank (Midtrans)</option>
                <option>Bayar di Tempat (COD)</option>
              </select>
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Ongkir</span>
                <span>
                  {ongkirTerpilih
                    ? `Rp ${Number(ongkirTerpilih.cost).toLocaleString("id-ID")}`
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 text-base pt-1">
                <span>Total</span>
                <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full bg-yellow-300 hover:bg-yellow-400 text-neutral-900 font-bold py-2.5 rounded-full transition-all disabled:opacity-50"
            >
              {processing ? "Memproses..." : "Buat Pesanan & Bayar"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}