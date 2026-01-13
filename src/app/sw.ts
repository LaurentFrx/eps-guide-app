/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin } from "serwist";
import { Serwist } from "serwist";

type ServiceWorkerManifestScope = ServiceWorkerGlobalScope &
  SerwistGlobalConfig & {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  };

declare const self: ServiceWorkerManifestScope;

const CACHE_VERSION = "v2026-01-12-banner";
const CACHE_PREFIX = "eps-guide-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const OFFLINE_URL = "/~offline";

const shouldPrecache = (entry: PrecacheEntry | string) => {
  const url = typeof entry === "string" ? entry : entry.url;
  return (
    !/\/muscu[\\/]+infographies[\\/]+/i.test(url) &&
    !/\/bac[\\/]+musculation[\\/]+pdfs[\\/]+/i.test(url)
  );
};

const runtimeCaching = [
  {
    matcher: ({ sameOrigin, url }: { sameOrigin: boolean; url: URL }) =>
      sameOrigin &&
      url.pathname.startsWith("/bac/musculation/pdfs/") &&
      url.pathname.endsWith(".pdf"),
    handler: new CacheFirst({
      cacheName: "musculation-pdfs",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 24,
          maxAgeSeconds: 60 * 60 * 24 * 90,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: (self.__SW_MANIFEST ?? []).filter(shouldPrecache),
  runtimeCaching,
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: true,
});

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(OFFLINE_URL).catch(() => undefined);
      await cache.add("/branding/flyer-eps-ht-1.png").catch(() => undefined);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) =>
          key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME
            ? caches.delete(key)
            : Promise.resolve(false)
        )
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Cache-first explicite pour /branding (évite les images cassées en PWA)
  if (url.origin === self.location.origin && url.pathname.startsWith("/branding/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return cached ?? Response.error();
        }
      })()
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req, { cache: "no-store" });
          if (res && res.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, res.clone());
            return res;
          }
        } catch {
          // Network error; fall back to cache/offline.
        }

        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(req);
        if (cached) return cached;

        const offline = await cache.match(OFFLINE_URL);
        if (offline) return offline;

        return Response.error();
      })()
    );
    return;
  }

  serwist.handleFetch(event);
});

self.addEventListener("message", serwist.handleCache);
self.addEventListener("install", serwist.handleInstall);
self.addEventListener("activate", serwist.handleActivate);
