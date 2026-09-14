"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

export default function EditCustomer() {
  useRoleGuard(["admin"]);

  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    authFetch(`/customer/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setNama(data.nama);
        setTelepon(data.telepon || "");
        setEmail(data.email || "");
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authFetch(`/customer/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ nama, telepon, email }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan perubahan");
      }

      router.push("/customer");
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
          Edit Customer
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nama
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Telepon
            </label>
            <input
              type="text"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

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