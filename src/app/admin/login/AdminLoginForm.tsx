"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";

type AdminLoginFormProps = {
  nextHref: string;
};

export default function AdminLoginForm({ nextHref }: AdminLoginFormProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Connexion impossible");
      setLoading(false);
      return;
    }

    router.replace(nextHref);
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
