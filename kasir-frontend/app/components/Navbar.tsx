"use client";

import { usePathname, useRouter } from "next/navigation";

const menu = [
  { href: "/", label: "Produk" },
  { href: "/kasir", label: "Kasir" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/kategori", label: "Kategori" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧾</span>
          <span className="font-semibold text-neutral-900">Kasir Admin</span>
        </div>

        <nav className="flex items-center gap-1 bg-neutral-100 rounded-full p-1">
          {menu.map((item) => {
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={
                  "text-sm px-3.5 py-1.5 rounded-full transition-colors " +
                  (active
                    ? "bg-yellow-400 text-neutral-900 font-medium"
                    : "text-neutral-600 hover:text-neutral-900")
                }
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}