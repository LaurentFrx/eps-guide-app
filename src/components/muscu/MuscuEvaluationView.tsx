"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { ImageZoomModal } from "@/components/muscu/ImageZoomModal";
import type { EvaluationProfile, Infographic } from "@/lib/muscu/types";

type MuscuEvaluationViewProps = {
  profiles: EvaluationProfile[];
  infographics: Infographic[];
};

export function MuscuEvaluationView({
  profiles,
  infographics,
}: MuscuEvaluationViewProps) {
  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");

  const selected = useMemo(
    () => profiles.find((profile) => profile.id === profileId) ?? profiles[0],
    [profiles, profileId]
  );

  return (
    <div className="space-y-4">
      <label className="space-y-1 text-xs uppercase tracking-widest text-white/60">
        Profil
        <select
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
          value={profileId}
          onChange={(event) => setProfileId(event.target.value)}
        >
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.title}
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <div className="space-y-4">
          {selected.sections.map((section) => (
            <GlassCard key={section.title} className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-white/60">
                {section.title}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </GlassCard>
          ))}

          {(selected.infographics ?? []).length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {selected.infographics?.map((src) => {
                const info = infographics.find((item) => item.src === src);
                const alt = info?.alt ?? "Infographie evaluation";
                return (
                  <ImageZoomModal
                    key={src}
                    src={src}
                    alt={alt}
                    className="shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
