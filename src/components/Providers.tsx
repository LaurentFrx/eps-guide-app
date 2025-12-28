"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@serwist/next/react";

export const Providers = ({ children }: { children: ReactNode }) => (
  <SerwistProvider
    swUrl="/sw.js"
    disable={process.env.NODE_ENV === "development"}
  >
    {children}
  </SerwistProvider>
);
