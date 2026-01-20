"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import { toDisplayBlocks } from "@/lib/editorial/uiParse";
import type { InlineSection } from "@/lib/editorial/uiParse";

type DetailSectionsProps = {
  sections: InlineSection[];
};

export function DetailSections({ sections }: DetailSectionsProps) {
  const sectionKeys = useMemo(
    () => sections.map((section) => section.key),
    [sections]
  );
  const [openKeys, setOpenKeys] = useState<string[]>(sectionKeys.slice(0, 1));
  const [activeKey, setActiveKey] = useState(sectionKeys[0] ?? "");

  const resolvedActiveKey = sectionKeys.includes(activeKey)
    ? activeKey
    : sectionKeys[0] ?? "";
  const resolvedOpenKeys = openKeys.filter((key) => sectionKeys.includes(key));

  const openAll = () => setOpenKeys(sectionKeys);
  const closeAll = () => setOpenKeys([]);

  const toggleSection = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleJump = (key: string) => {
    setActiveKey(key);
    setOpenKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    const el = document.getElementById(`detail-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!sections.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => handleJump(section.key)}
              aria-current={resolvedActiveKey === section.key ? "true" : undefined}
              className={cn(
                "ui-chip h-7 shrink-0 px-3 text-xs font-medium transition",
                resolvedActiveKey === section.key
                  ? "is-active"
                  : "hover:text-white"
              )}
            >
              {section.title}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={openAll} className="ui-chip">
            Tout déplier
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={closeAll} className="ui-chip">
            Tout replier
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {sections.map((section) => {
          const isOpen = resolvedOpenKeys.includes(section.key);
          const blocks = toDisplayBlocks(section.content, "paragraph");

          return (
            <GlassCard
              key={section.key}
              id={`detail-${section.key}`}
              className="scroll-mt-24"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={isOpen}
                aria-controls={`detail-panel-${section.key}`}
              >
                <p className="text-sm font-semibold text-white">
                  {section.title}
                </p>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-white/60 transition",
                    isOpen ? "rotate-180" : ""
                  )}
                />
              </button>
              {isOpen ? (
                <div
                  id={`detail-panel-${section.key}`}
                  className="mt-3 max-w-prose space-y-3 text-sm leading-relaxed text-white/75"
                >
                  {blocks.map((block, index) =>
                    block.type === "paragraph" ? (
                      <p key={`p-${section.key}-${index}`} className="whitespace-pre-wrap">
                        {block.text}
                      </p>
                    ) : (
                      <ul
                        key={`l-${section.key}-${index}`}
                        className="list-disc space-y-2 pl-5"
                      >
                        {block.items.map((item, itemIndex) => (
                          <li
                            key={`i-${section.key}-${index}-${itemIndex}`}
                            className="whitespace-pre-wrap"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
              ) : null}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

