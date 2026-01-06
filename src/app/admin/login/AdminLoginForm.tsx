"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";

type AdminLoginFormProps = {
  nextHref: string;
};

export default function AdminLoginForm({ nextHref }: AdminLoginFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (password) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      const value = inputRef.current?.value ?? "";
      if (value) {
        setPassword(value);
      }
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Connexion impossible");
        return;
      }

      router.replace(nextHref);
    } catch {
      setError("Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="space-y-4 max-w-md">
      <div>
        <p className="text-xs uppercase tracking-widest text-white/60">
          Accès admin
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Se connecter
        </h1>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          type="password"
          value={password}
          placeholder="Mot de passe"
          onChange={(event) => setPassword(event.target.value)}
          name="password"
          autoComplete="current-password"
          autoFocus
          ref={inputRef}
        />
        {error ? (
          <p className="text-sm text-red-200">{error}</p>
        ) : null}
        <Button type="submit" className="ui-btn-primary w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </GlassCard>
  );
}
