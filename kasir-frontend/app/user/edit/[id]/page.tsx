"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type Role = {
  id: number;
  nama: string;
};

export default function EditUser() {
  useRoleGuard(["admin"]);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    Promise.all([
      authFetch(`/user/${id}`).then((res) => res.json()),
      authFetch("/role").then((res) => res.json()),
    ])
      .then(([userData, roleData]) => {
        setEmail(userData.email);
        setRole(userData.role);
        setRoleList(roleData);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authFetch(`/user/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ email, role }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan perubahan");
      }

      router.push("/user");
    } catch (err) {
      setError("Gagal menyimpan perubahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="text-neutral-400">Loading...</p>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-neutral-900 mb-6">
          Edit User
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              {roleList.map((r) => (
                <option key={r.id} value={r.nama}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-neutral-400 mb-4">
            Password tidak bisa diubah dari sini. Hapus dan buat ulang akun
            kalau perlu ganti password.
          </p>

          {error && <p className="text-sm text-red-600 mb-4 -mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-neutral-900 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}