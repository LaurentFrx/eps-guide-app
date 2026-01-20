import { cn } from "@/lib/utils";

type WavesBackgroundProps = {
  className?: string;
};

export function WavesBackground({ className }: WavesBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0b1020 0%, #101827 58%, #0b1020 120%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(900px circle at 12% -10%, rgba(91, 119, 172, 0.45), transparent 60%), radial-gradient(800px circle at 92% 12%, rgba(244, 168, 184, 0.2), transparent 65%)",
        }}
      />
      <svg
        className="absolute left-0 top-0 h-64 w-[140%] opacity-15"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
      >
        <path
          d="M0,180 C200,120 400,220 600,170 C800,120 1000,220 1200,160"
          stroke="rgba(201, 179, 255, 0.55)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0,230 C220,160 420,240 640,200 C860,160 1060,240 1200,200"
          stroke="rgba(185, 192, 212, 0.35)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 h-56 w-[130%] opacity-12"
        viewBox="0 0 1200 260"
        preserveAspectRatio="none"
      >
        <path
          d="M0,120 C240,200 420,80 640,140 C860,200 1040,80 1200,120"
          stroke="rgba(89, 240, 107, 0.35)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0,170 C240,230 440,120 660,170 C880,220 1040,120 1200,170"
          stroke="rgba(201, 179, 255, 0.3)"
          strokeWidth="1.4"
          fill="none"
        />
      </svg>
    </div>
  );
}
