"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type BacCopyLinkButtonProps = {
  url?: string;
};

const COPY_RESET_MS = 1800;

export function BacCopyLinkButton({ url }: BacCopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const target = url ?? window.location.href;
      await navigator.clipboard.writeText(target);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="ui-chip gap-2"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span>{copied ? "Lien copie" : "Copier le lien"}</span>
    </Button>
  );
}
