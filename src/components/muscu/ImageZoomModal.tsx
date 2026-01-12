"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ImageZoomModalProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ImageZoomModal({ src, alt, className }: ImageZoomModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative block w-full overflow-hidden rounded-xl border border-white/10 bg-black/20",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-auto w-full object-cover" />
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-white/80">
          Zoom
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="h-auto max-h-[90vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
