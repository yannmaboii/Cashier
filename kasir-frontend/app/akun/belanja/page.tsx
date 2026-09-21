"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BelanjaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/akun");
  }, [router]);

  return null;
} 