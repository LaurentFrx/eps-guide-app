import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const adminNetworkOnly = {
  matcher: ({ url }: { url: URL }) =>
    url.pathname.startsWith("/admin/") ||
    url.pathname.startsWith("/api/admin/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/sw.js",
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: [adminNetworkOnly, ...defaultCache],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
});

serwist.addEventListeners();
