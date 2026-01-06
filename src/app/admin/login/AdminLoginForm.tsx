"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";

type AdminLoginFormProps = {
  nextHref: string;
};

export default function AdminLoginForm({ nextHref }: AdminLoginFormProps) {
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

    const pw =
      (password ?? "").trim() || (inputRef.current?.value ?? "").trim();
    if (!pw) {
      setError("mot de passe requis");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
        credentials: "same-origin",
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok !== true) {
        setError(payload.error ?? "Connexion impossible");
        return;
      }

      window.location.assign(nextHref);
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
