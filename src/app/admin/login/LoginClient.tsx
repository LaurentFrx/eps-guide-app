"use client";

import { useSearchParams } from "next/navigation";
import AdminLoginForm from "./AdminLoginForm";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  return <AdminLoginForm nextHref={next} />;
}
