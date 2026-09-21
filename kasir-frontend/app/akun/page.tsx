"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authFetch } from "@/lib/api";

// TODO: ganti kalau lokasi asal toko berubah
const ORIGIN_ID = 8301; // Laladon, Ciomas, Bogor, Jawa Barat
const API_URL = "http://localhost:3000";

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

type Pesanan = {
  id: number;
  kodeTransaksi: string;
  total: number;
  status: string;
  createdAt: string;
  items: { id: number; jumlah: number; produk: { nama: string } }[];
};

type Profil = {
  id: number;
  nama: string;
  telepon: string | null;
  email: string;
  alamat: string | null;
  foto: string | null;
};

const kurirList = [
  { code: "jne", label: "JNE" },
  { code: "jnt", label: "J&T Express" },
  { code: "sicepat", label: "SiCepat" },
  { code: "pos", label: "Pos Indonesia" },
  { code: "tiki", label: "TIKI" },
  { code: "anteraja", label: "AnterAja" },
];

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
  diproses: "bg-amber-50 text-amber-700",
  dikirim: "bg-purple-50 text-purple-600",
  selesai: "bg-emerald-50 text-emerald-700",
  dibatalkan: "bg-neutral-100 text-neutral-500",
};

export default function AkunPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"belanja" | "pesanan" | "profil">("belanja");
  const [username, setUsername] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Produk & kategori
  const [produk, setProduk] = useState<Produk[]>([]);
  const [loadingProduk, setLoadingProduk] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [cari, setCari] = useState("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [alamat, setAlamat] = useState("");
  const [metode, setMetode] = useState("Transfer Bank (Midtrans)");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Ongkir
  const [cariTujuan, setCariTujuan] = useState("");
  const [hasilTujuan, setHasilTujuan] = useState<Destinasi[]>([]);
  const [tujuan, setTujuan] = useState<Destinasi | null>(null);
  const [kurir, setKurir] = useState("jne");
  const [opsiOngkir, setOpsiOngkir] = useState<OngkirOption[]>([]);
  const [ongkirTerpilih, setOngkirTerpilih] = useState<OngkirOption | null>(
    null
  );
  const [cariLoading, setCariLoading] = useState(false);
  const [ongkirLoading, setOngkirLoading] = useState(false);

  // Pesanan
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loadingPesanan, setLoadingPesanan] = useState(true);

  // Profil
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loadingProfil, setLoadingProfil] = useState(true);
  const [editNama, setEditNama] = useState("");
  const [editTelepon, setEditTelepon] = useState("");
  const [editAlamat, setEditAlamat] = useState("");
  const [fotoBaru, setFotoBaru] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [savingProfil, setSavingProfil] = useState(false);
  const [profilError, setProfilError] = useState("");
  const [profilSukses, setProfilSukses] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSukses, setPasswordSukses] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setUsername(
      localStorage.getItem("username") || localStorage.getItem("email") || ""
    );

    fetch(`${API_URL}/produk`)
      .then((res) => res.json())
      .then((data) => {
        setProduk(data);
        setLoadingProduk(false);
      })
      .catch(() => setLoadingProduk(false));

    loadPesanan();
    loadProfil();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadPesanan = () => {
    authFetch("/transaksi/saya")
      .then((res) => res.json())
      .then((data) => {
        setPesanan(data);
        setLoadingPesanan(false);
      })
      .catch(() => setLoadingPesanan(false));
  };

  const loadProfil = () => {
    authFetch("/customer/me")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Profil) => {
        setProfil(data);
        setEditNama(data.nama || "");
        setEditTelepon(data.telepon || "");
        setEditAlamat(data.alamat || "");
        setLoadingProfil(false);

        setAlamat((prev) => (prev ? prev : data.alamat || ""));
      })
      .catch(() => setLoadingProfil(false));
  };

  const kategoriList = useMemo(() => {
    const unik = Array.from(
      new Set(produk.map((p) => p.kategori).filter(Boolean))
    );
    return ["Semua", ...unik];
  }, [produk]);

  const produkTampil = produk.filter((p) => {
    const cocokKategori =
      kategoriAktif === "Semua" || p.kategori === kategoriAktif;
    const cocokCari = p.nama.toLowerCase().includes(cari.toLowerCase());
    return cocokKategori && cocokCari;
  });

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
            : item
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
            : item
        )
        .filter((item) => item.jumlah > 0)
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.harga * item.jumlah,
    0
  );
  const totalBerat = cart.reduce((sum, item) => sum + item.jumlah * 500, 0);
  const grandTotal = subtotal + (ongkirTerpilih?.cost || 0);
  const jumlahItemCart = cart.reduce((sum, item) => sum + item.jumlah, 0);

  const handleCariTujuan = async () => {
    if (!cariTujuan.trim()) return;
    setCariLoading(true);
    setHasilTujuan([]);
    try {
      const res = await fetch(
        `${API_URL}/ongkir/destinasi?search=${encodeURIComponent(
          cariTujuan
        )}`
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
      const res = await fetch(`${API_URL}/ongkir/cek`, {
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
        setCart([]);
        setTab("pesanan");
        loadPesanan();
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
          "Pesanan dibuat, tapi gagal membuka halaman pembayaran. Cek di Pesanan Saya."
        );
      }

      const bayarData = await bayarRes.json();

      if (bayarData.redirect_url) {
        window.location.href = bayarData.redirect_url;
      } else {
        setCart([]);
        setTab("pesanan");
        loadPesanan();
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat pesanan");
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    router.push("/login");
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFotoBaru(file);
    setPreviewFoto(file ? URL.createObjectURL(file) : null);
  };

  const handleSimpanProfil = async () => {
    setProfilError("");
    setProfilSukses("");
    setSavingProfil(true);

    try {
      const res = await authFetch("/customer/me", {
        method: "PATCH",
        body: JSON.stringify({
          nama: editNama,
          telepon: editTelepon,
          alamat: editAlamat,
        }),
      });

      if (!res.ok) throw new Error();

      if (fotoBaru) {
        const formData = new FormData();
        formData.append("foto", fotoBaru);
        await authFetch("/customer/me/foto", {
          method: "POST",
          body: formData,
        });
      }

      setProfilSukses("Profil berhasil diperbarui");
      setUsername(editNama);
      localStorage.setItem("username", editNama);
      loadProfil();
    } catch {
      setProfilError("Gagal menyimpan profil, coba lagi");
    } finally {
      setSavingProfil(false);
    }
  };

  const handleGantiPassword = async () => {
    setPasswordError("");
    setPasswordSukses("");

    if (!oldPassword || !newPassword) {
      setPasswordError("Isi password lama dan baru");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await authFetch("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Gagal mengganti password");
      }

      setPasswordSukses("Password berhasil diganti");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Gagal mengganti password");
    } finally {
      setSavingPassword(false);
    }
  };

  const pesananAktif = pesanan.filter(
    (p) => p.status !== "selesai" && p.status !== "dibatalkan"
  ).length;

  const tampilkanFotoProfil =
    previewFoto || (profil?.foto ? `${API_URL}${profil.foto}` : null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 relative overflow-x-hidden">
      {/* Parallax kelopak bunga - ambient, halus, di belakang semua konten */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <span className="ambient-petal" style={{ left: "8%", animationDelay: "0s", animationDuration: "26s" }}>🌸</span>
        <span className="ambient-petal" style={{ left: "22%", animationDelay: "5s", animationDuration: "31s" }}>🌼</span>
        <span className="ambient-petal" style={{ left: "40%", animationDelay: "11s", animationDuration: "24s" }}>🌷</span>
        <span className="ambient-petal" style={{ left: "58%", animationDelay: "3s", animationDuration: "29s" }}>🌸</span>
        <span className="ambient-petal" style={{ left: "74%", animationDelay: "14s", animationDuration: "27s" }}>🌼</span>
        <span className="ambient-petal" style={{ left: "90%", animationDelay: "8s", animationDuration: "33s" }}>🌷</span>
      </div>

      {/* Header */}
      <header
        className={
          "bg-white/90 backdrop-blur border-b sticky top-0 z-20 transition-shadow duration-300 " +
          (scrolled
            ? "border-yellow-100 shadow-md shadow-yellow-100/40"
            : "border-yellow-100/60 shadow-none")
        }
      >
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-4">
          <Image
            src="/logo-fleur.png"
            alt="Fleur Imperium"
            width={140}
            height={56}
            className="h-11 w-auto shrink-0"
            priority
          />

          {tab === "belanja" && (
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari buket bunga, snack bouquet..."
                className="w-full px-4 py-2.5 rounded-full border-2 border-yellow-100 bg-yellow-50/50 text-sm focus:outline-none focus:border-yellow-300 focus:bg-white transition-all duration-300"
              />
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTab("belanja")}
              className={
                "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 " +
                (tab === "belanja"
                  ? "bg-yellow-300 text-neutral-900 shadow-sm scale-100"
                  : "text-neutral-500 hover:bg-yellow-50 hover:scale-105")
              }
            >
              🛍️ Belanja
              {jumlahItemCart > 0 && (
                <span className="ml-1.5 bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {jumlahItemCart}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("pesanan")}
              className={
                "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 " +
                (tab === "pesanan"
                  ? "bg-yellow-300 text-neutral-900 shadow-sm scale-100"
                  : "text-neutral-500 hover:bg-yellow-50 hover:scale-105")
              }
            >
              📦 Pesanan Saya
              {pesananAktif > 0 && (
                <span className="ml-1.5 bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {pesananAktif}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("profil")}
              className={
                "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 " +
                (tab === "profil"
                  ? "bg-yellow-300 text-neutral-900 shadow-sm scale-100"
                  : "text-neutral-500 hover:bg-yellow-50 hover:scale-105")
              }
            >
              👤 Profil
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm font-medium text-neutral-500 border-2 border-neutral-200 hover:border-red-300 hover:text-red-500 transition-all duration-300"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* ================= TAB: BELANJA ================= */}
      {tab === "belanja" && (
        <div key="belanja" className="relative z-10 tab-fade-in">
          {/* Hero singkat, elegan, kompak */}
          <div className="max-w-7xl mx-auto px-5 pt-8 pb-2 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-800 tracking-tight">
              Rangkai Momen Indahmu 🌷
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Buket bunga segar, dirangkai dengan cinta oleh Fleur Imperium
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-5 py-6 flex flex-col lg:flex-row gap-6 items-start">
            <aside className="w-full lg:w-52 shrink-0 lg:sticky lg:top-24 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
              {kategoriList.map((k) => (
                <button
                  key={k}
                  onClick={() => setKategoriAktif(k)}
                  className={
                    "shrink-0 text-left px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border-2 " +
                    (kategoriAktif === k
                      ? "bg-yellow-300 border-yellow-300 text-neutral-900 shadow-sm"
                      : "bg-white border-yellow-100 text-neutral-600 hover:border-yellow-300 hover:-translate-y-0.5")
                  }
                >
                  {k === "Semua" ? "🌸 Semua Produk" : k}
                </button>
              ))}
            </aside>

            <section className="flex-1 min-w-0">
              {loadingProduk ? (
                <p className="text-neutral-400 text-sm">Loading...</p>
              ) : produkTampil.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-yellow-100 p-10 text-center">
                  <p className="text-4xl mb-2">🌷</p>
                  <p className="text-neutral-400 text-sm">
                    Tidak ada produk ditemukan.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {produkTampil.map((p, idx) => (
                    <div
                      key={p.id}
                      className="group bg-white border-2 border-yellow-100 rounded-2xl p-3 shadow-sm hover:shadow-lg hover:shadow-yellow-100/60 hover:border-yellow-300 hover:-translate-y-1 transition-all duration-300 fade-in-item"
                      style={{ animationDelay: `${Math.min(idx * 45, 400)}ms` }}
                    >
                      <div className="w-full aspect-square rounded-xl bg-yellow-50 overflow-hidden flex items-center justify-center mb-2.5">
                        {p.foto ? (
                          <img
                            src={`${API_URL}${p.foto}`}
                            alt={p.nama}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <span className="text-4xl">🌼</span>
                        )}
                      </div>
                      <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wide mb-0.5">
                        {p.kategori}
                      </p>
                      <p className="font-semibold text-neutral-900 text-sm leading-snug mb-1">
                        {p.nama}
                      </p>
                      <p className="text-xs text-neutral-400 mb-2.5">
                        Stok: {p.stok}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 text-sm">
                          Rp {Number(p.harga).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => tambahKeCart(p)}
                          disabled={p.stok < 1}
                          className="w-8 h-8 rounded-full bg-yellow-300 hover:bg-yellow-400 active:scale-90 text-neutral-900 font-bold text-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30 hover:shadow-md hover:shadow-yellow-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24">
              <div className="bg-white border-2 border-yellow-100 rounded-[1.75rem] shadow-lg shadow-yellow-100/50 p-5 space-y-4 transition-shadow duration-300 hover:shadow-xl hover:shadow-yellow-100/60">
                <div>
                  <h2 className="font-bold text-neutral-900 mb-2.5">
                    🧺 Keranjang
                  </h2>
                  {cart.length === 0 ? (
                    <p className="text-sm text-neutral-400">
                      Belum ada produk dipilih
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {cart.map((item) => (
                        <div
                          key={item.produkId}
                          className="flex items-center justify-between text-sm cart-item-in"
                        >
                          <div className="min-w-0">
                            <p className="text-neutral-800 font-medium truncate">
                              {item.nama}
                            </p>
                            <p className="text-xs text-neutral-400">
                              Rp {item.harga.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              onClick={() => ubahJumlah(item.produkId, -1)}
                              className="w-6 h-6 rounded-full border border-neutral-300 text-neutral-600 transition-transform duration-150 active:scale-90"
                            >
                              −
                            </button>
                            <span className="w-4 text-center text-xs font-semibold">
                              {item.jumlah}
                            </span>
                            <button
                              onClick={() => ubahJumlah(item.produkId, 1)}
                              className="w-6 h-6 rounded-full border border-neutral-300 text-neutral-600 transition-transform duration-150 active:scale-90"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-yellow-100 pt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-600">
                      Alamat Lengkap
                    </label>
                    {profil?.alamat && (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        dari profil
                      </span>
                    )}
                  </div>
                  <textarea
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    rows={2}
                    placeholder="Jl. Contoh No. 123, RT/RW..."
                    className="w-full px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300 transition-colors duration-300"
                  />
                </div>

                <div className="border-t border-yellow-100 pt-3">
                  <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                    Cari Kecamatan Tujuan
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={cariTujuan}
                      onChange={(e) => setCariTujuan(e.target.value)}
                      placeholder="misal: Dramaga"
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300 transition-colors duration-300"
                    />
                    <button
                      onClick={handleCariTujuan}
                      disabled={cariLoading}
                      className="text-xs bg-neutral-800 text-white px-3 rounded-xl font-semibold transition-transform duration-150 active:scale-95"
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
                          className="w-full text-left text-xs px-3 py-2 hover:bg-yellow-50 border-b border-neutral-100 last:border-0 transition-colors duration-150"
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {tujuan && (
                    <p className="text-xs text-emerald-600 mb-2 font-medium">
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
                    className="w-full text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2 rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {ongkirLoading ? "Menghitung..." : "Cek Ongkos Kirim"}
                  </button>

                  {opsiOngkir.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {opsiOngkir.map((o, i) => (
                        <button
                          key={i}
                          onClick={() => setOngkirTerpilih(o)}
                          className={
                            "w-full text-left text-xs px-3 py-2 rounded-xl border-2 transition-all duration-200 " +
                            (ongkirTerpilih === o
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-neutral-200 hover:border-yellow-200")
                          }
                        >
                          <div className="flex justify-between font-semibold text-neutral-800">
                            <span>
                              {o.name} {o.service}
                            </span>
                            <span>
                              Rp {Number(o.cost).toLocaleString("id-ID")}
                            </span>
                          </div>
                          {o.etd && (
                            <p className="text-neutral-400">
                              Estimasi {o.etd} hari
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-yellow-100 pt-3">
                  <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
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

                <div className="border-t border-yellow-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Ongkir</span>
                    <span>
                      {ongkirTerpilih
                        ? `Rp ${Number(ongkirTerpilih.cost).toLocaleString(
                            "id-ID"
                          )}`
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
                  className="w-full bg-yellow-300 hover:bg-yellow-400 active:scale-95 text-neutral-900 font-bold py-3 rounded-full shadow-md shadow-yellow-200 hover:shadow-lg hover:shadow-yellow-200 transition-all duration-300 disabled:opacity-50"
                >
                  {processing ? "Memproses..." : "Buat Pesanan & Bayar"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ================= TAB: PESANAN SAYA ================= */}
      {tab === "pesanan" && (
        <div key="pesanan" className="relative z-10 tab-fade-in max-w-2xl mx-auto px-5 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-neutral-800">
              Halo, {username}! 👋
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Berikut riwayat pesanan kamu
            </p>
          </div>

          {loadingPesanan ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : pesanan.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-yellow-100 p-10 text-center">
              <p className="text-4xl mb-2">🌼</p>
              <p className="text-neutral-400 text-sm">Belum ada pesanan.</p>
              <button
                onClick={() => setTab("belanja")}
                className="mt-4 text-sm font-bold text-amber-700 bg-amber-50 px-5 py-2 rounded-full transition-transform duration-200 hover:scale-105"
              >
                Mulai belanja →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pesanan.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-white border-2 border-yellow-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 fade-in-item"
                  style={{ animationDelay: `${Math.min(idx * 60, 400)}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-mono text-neutral-400">
                        {p.kodeTransaksi}
                      </p>
                      <p className="font-bold text-neutral-900 mt-0.5">
                        Rp {Number(p.total).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span
                      className={
                        "text-xs px-3 py-1 rounded-full font-semibold " +
                        (statusColor[p.status] || "bg-neutral-100")
                      }
                    >
                      {statusLabel[p.status] || p.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {p.items
                      .map((i) => `${i.produk.nama} x${i.jumlah}`)
                      .join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: PROFIL ================= */}
      {tab === "profil" && (
        <div key="profil" className="relative z-10 tab-fade-in max-w-lg mx-auto px-5 py-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-neutral-800">
              Profil Saya
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Kelola data diri, alamat, dan keamanan akun kamu
            </p>
          </div>

          {loadingProfil ? (
            <p className="text-neutral-400 text-sm">Loading...</p>
          ) : (
            <>
              <div className="bg-white border-2 border-yellow-100 rounded-[1.75rem] shadow-sm p-6 mb-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-yellow-100/50">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-20 h-20 rounded-full bg-yellow-50 overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-yellow-100">
                    {tampilkanFotoProfil ? (
                      <img
                        src={tampilkanFotoProfil}
                        alt="Foto profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFotoChange}
                      className="text-xs text-neutral-500"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      JPG, PNG, atau WEBP. Maks 2MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      Nama
                    </label>
                    <input
                      type="text"
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300 transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      Email
                    </label>
                    <input
                      type="text"
                      value={profil?.email || ""}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-100 bg-neutral-50 text-sm text-neutral-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      Telepon
                    </label>
                    <input
                      type="text"
                      value={editTelepon}
                      onChange={(e) => setEditTelepon(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300 transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      Alamat Tersimpan
                    </label>
                    <textarea
                      value={editAlamat}
                      onChange={(e) => setEditAlamat(e.target.value)}
                      rows={2}
                      placeholder="Jl. Contoh No. 123, RT/RW..."
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300 transition-colors duration-300"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Alamat ini otomatis dipakai saat checkout, tapi tetap
                      bisa diganti manual di keranjang.
                    </p>
                  </div>
                </div>

                {profilError && (
                  <p className="text-xs text-red-500 mt-3">{profilError}</p>
                )}
                {profilSukses && (
                  <p className="text-xs text-emerald-600 mt-3">
                    {profilSukses}
                  </p>
                )}

                <button
                  onClick={handleSimpanProfil}
                  disabled={savingProfil}
                  className="w-full mt-4 bg-yellow-300 hover:bg-yellow-400 active:scale-95 text-neutral-900 font-bold py-2.5 rounded-full transition-all duration-300 disabled:opacity-50"
                >
                  {savingProfil ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>

              <div className="bg-white border-2 border-yellow-100 rounded-[1.75rem] shadow-sm p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-yellow-100/50">
                <h2 className="font-bold text-neutral-900 mb-3">
                  🔒 Ganti Password
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      Password Lama
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300 transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-neutral-200 text-sm focus:outline-none focus:border-yellow-300 transition-colors duration-300"
                    />
                  </div>
                </div>

                {passwordError && (
                  <p className="text-xs text-red-500 mt-3">{passwordError}</p>
                )}
                {passwordSukses && (
                  <p className="text-xs text-emerald-600 mt-3">
                    {passwordSukses}
                  </p>
                )}

                <button
                  onClick={handleGantiPassword}
                  disabled={savingPassword}
                  className="w-full mt-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-full transition-all duration-300 disabled:opacity-50"
                >
                  {savingPassword ? "Menyimpan..." : "Ganti Password"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        .ambient-petal {
          position: absolute;
          bottom: -8%;
          font-size: 1.4rem;
          opacity: 0;
          animation-name: petalDrift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes petalDrift {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: 0.35;
          }
          50% {
            transform: translateY(-55vh) translateX(15px) rotate(90deg);
            opacity: 0.28;
          }
          92% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-105vh) translateX(-10px) rotate(180deg);
            opacity: 0;
          }
        }

        .fade-in-item {
          animation: fadeInUp 0.5s ease-out both;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tab-fade-in {
          animation: tabFade 0.35s ease-out;
        }
        @keyframes tabFade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cart-item-in {
          animation: cartItemIn 0.3s ease-out;
        }
        @keyframes cartItemIn {
          from {
            opacity: 0;
            transform: translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </main>
  );
}