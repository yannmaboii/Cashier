"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function defaultRouteForRole(role: string | null) {
  if (role === "kasir") return "/kasir";
  if (role === "customer") return "/akun";
  return "/";
}

export function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const role = localStorage.getItem("role");
    if (role && !allowedRoles.includes(role)) {
      router.replace(defaultRouteForRole(role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}