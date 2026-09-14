"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type Role = {
  id: number;
  nama: string;
};

export default function RolePage() {
  useRoleGuard(["admin"]);

  const [role, setRole] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRole = () => {
    authFetch("/role")
      .then((res) => res.json())
      .then((data) => {
        setRole(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadRole();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    const konfirmasi = confirm(`Yakin mau hapus role "${nama}"?`);
    if (!konfirmasi) return;

    try {
      const res = await authFetch(`/role/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus role");
      loadRole();
    } catch (err) {
      alert("Gagal menghapus role, coba lagi");
    }
  };

  if (loading) {
    return <p className="text-neutral-400">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-neutral-900">
          Kelola Role
        </h1>
        <a
          href="/role/tambah"
          className="text-sm bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-medium rounded-lg px-4 py-2"
        >
          + Tambah Role
        </a>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-neutral-500">
              <th className="text-left font-medium px-4 py-3">Nama Role</th>
              <th className="text-left font-medium px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {role.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 text-neutral-800 font-medium">
                  {r.nama}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a
                      href={`/role/edit/${r.id}`}
                      className="text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-300 rounded-lg px-3 py-1.5"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(r.id, r.nama)}
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