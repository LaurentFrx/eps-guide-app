import Image from "next/image";
import { FlyerFrame } from "@/components/FlyerFrame";
import { cn } from "@/lib/utils";

type FlyerHeaderProps = {
  className?: string;
};

export function FlyerHeader({ className }: FlyerHeaderProps) {
  return (
    <section aria-label="Bandeau Guide Musculation" className={cn("mb-4", className)}>
      <FlyerFrame>
        <div className="relative aspect-[3/1] w-full">
          <Image
            src="/branding/flyer-eps-ht-1.png"
            alt="Guide Musculation"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            style={{ objectPosition: "50% 55%" }}
          />
        </div>
      </FlyerFrame>
    </section>
  );
}
