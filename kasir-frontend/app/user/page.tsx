"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type UserData = {
  id: number;
  email: string;
  role: string;
};

export default function UserPage() {
  useRoleGuard(["admin"]);

  const [user, setUser] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    authFetch("/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleDelete = async (id: number, email: string) => {
    const konfirmasi = confirm(`Yakin mau hapus akun "${email}"?`);
    if (!konfirmasi) return;

    try {
      const res = await authFetch(`/user/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus user");
      loadUser();
    } catch (err) {
      alert("Gagal menghapus user, coba lagi");
    }
  };

  if (loading) {
    return <p className="text-neutral-400">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-neutral-900">
          Kelola Staff
        </h1>
        <a
          href="/user/tambah"
          className="text-sm bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-medium rounded-lg px-4 py-2"
        >
          + Tambah User
        </a>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-neutral-500">
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3">Role</th>
              <th className="text-left font-medium px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {user.map((u) => (
              <tr key={u.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 text-neutral-800 font-medium">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-neutral-700">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a
                      href={`/user/edit/${u.id}`}
                      className="text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-300 rounded-lg px-3 py-1.5"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
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