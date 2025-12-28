import { defaultCache } from "@serwist/next/worker";
import { CacheFirst, Serwist, StaleWhileRevalidate } from "serwist";
import { CacheableResponsePlugin } from "serwist/cacheable-response";
import { ExpirationPlugin } from "serwist/expiration";
import { matchPrecache } from "serwist/precache";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision: string }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/images/") && url.pathname.endsWith(".jpg"),
      handler: new CacheFirst({
        cacheName: "eps-images",
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 365 * 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/data/") && url.pathname.endsWith(".json"),
      handler: new StaleWhileRevalidate({
        cacheName: "eps-data",
        plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
      }),
    },
    ...defaultCache,
  ],
});

serwist.setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return (await matchPrecache("/~offline")) ?? Response.error();
  }
  return Response.error();
});

serwist.addEventListeners();
