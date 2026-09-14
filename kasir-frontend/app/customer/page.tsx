"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type Customer = {
  id: number;
  nama: string;
  telepon: string;
  email: string;
};

export default function CustomerPage() {
  useRoleGuard(["admin"]);

  const [customer, setCustomer] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomer = () => {
    authFetch("/customer")
      .then((res) => res.json())
      .then((data) => {
        setCustomer(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomer();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    const konfirmasi = confirm(`Yakin mau hapus customer "${nama}"?`);
    if (!konfirmasi) return;

    try {
      const res = await authFetch(`/customer/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus customer");
      loadCustomer();
    } catch (err) {
      alert("Gagal menghapus customer, coba lagi");
    }
  };

  if (loading) {
    return <p className="text-neutral-400">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-neutral-900">
          Kelola Customer
        </h1>
        <a
          href="/customer/tambah"
          className="text-sm bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-medium rounded-lg px-4 py-2"
        >
          + Tambah Customer
        </a>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-neutral-500">
              <th className="text-left font-medium px-4 py-3">Nama</th>
              <th className="text-left font-medium px-4 py-3">Telepon</th>
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {customer.map((c) => (
              <tr key={c.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 text-neutral-800 font-medium">
                  {c.nama}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {c.telepon || "-"}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {c.email || "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a
                      href={`/customer/edit/${c.id}`}
                      className="text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-300 rounded-lg px-3 py-1.5"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(c.id, c.nama)}
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