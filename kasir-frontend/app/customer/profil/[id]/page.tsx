"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";

type Customer = {
  id: number;
  nama: string;
  telepon: string;
  email: string;
  alamat: string | null;
  foto: string | null;
};

export default function LihatProfilCustomer() {
  useRoleGuard(["admin"]);

  const params = useParams();
  const id = params.id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch(`/customer/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCustomer(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat profil customer");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="text-slate-400">Loading...</p>;
  }

  if (error || !customer) {
    return <p className="text-red-500 text-sm">{error || "Data tidak ditemukan"}</p>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md">
        <a href="/customer" className="text-sm text-slate-500 mb-4 inline-block">
          ← Kembali ke Kelola Customer
        </a>

        <div className="clay-surface rounded-3xl p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 mb-3">
              {customer.foto ? (
                <img
                  src={`http://localhost:3000${customer.foto}`}
                  alt={customer.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              {customer.nama}
            </h1>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Email
              </p>
              <p className="text-sm text-slate-800">{customer.email || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Telepon
              </p>
              <p className="text-sm text-slate-800">
                {customer.telepon || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Alamat Tersimpan
              </p>
              <p className="text-sm text-slate-800 leading-relaxed">
                {customer.alamat || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}