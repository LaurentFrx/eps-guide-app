"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ClientRedirectProps = {
  to: string;
  replace?: boolean;
};

export default function ClientRedirect({ to, replace = true }: ClientRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [replace, router, to]);

  return null;
}
