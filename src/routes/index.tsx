import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { claimAccount, getClaimStatus } from "@/lib/keepsake.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Keepsake — A private space for two" },
      {
        name: "description",
        content:
          "The Keepsake is a private, invite-only home for our letters, photos, memories and plans. Sign in to continue.",
      },
      { property: "og:title", content: "The Keepsake — A private space for two" },
      {
        property: "og:description",
        content: "A private, invite-only home for our letters, photos, memories and plans.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthLanding,
});

function AuthLanding() {
  const navigate = useNavigate();
  const claim = useServerFn(claimAccount);
  const claimStatus = useServerFn(getClaimStatus);

  const [mode, setMode] = useState<"signin" | "claim">("signin");
  const [seatsLeft, setSeatsLeft] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/home", replace: true });
    });
    void claimStatus()
      .then((r) => active && setSeatsLeft(r.seatsLeft))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [claimStatus, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "claim") {
        await claim({ data: { email, password, displayName } });
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw new Error(signInError.message);
      navigate({ to: "/home", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-cream-glow px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 26, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card w-full max-w-md rounded-[2rem] px-7 py-10 sm:px-10"
      >
        <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.45em] text-rosegold">
          Est. 08.11.2025
        </p>
        <h1 className="text-gradient-rose mt-3 text-center font-serif text-4xl font-medium sm:text-5xl">
          The Keepsake
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
          A private place for our letters, photographs, and everything still ahead of us.
        </p>

        <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-rosegold/70">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-rosegold/60" />
          <span className="text-sm">❤</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-rosegold/60" />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "claim" && (
            <Field
              label="Your name"
              value={displayName}
              onChange={setDisplayName}
              type="text"
              placeholder="Maxine"
            />
          )}
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="••••••••"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="btn-glow btn-glow-hover w-full rounded-full px-8 py-3.5 text-sm font-medium uppercase tracking-[0.2em] disabled:opacity-60"
          >
            {busy ? "One moment…" : mode === "claim" ? "Create our account" : "Enter"}
          </button>
        </form>

        {seatsLeft !== null && seatsLeft > 0 && (
          <button
            onClick={() => {
              setMode(mode === "claim" ? "signin" : "claim");
              setError(null);
            }}
            className="mt-6 w-full text-center text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-rosegold"
          >
            {mode === "claim"
              ? "I already have an account"
              : `Set up an account (${seatsLeft} left)`}
          </button>
        )}

        <p className="mt-6 text-center text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground/70">
          For two people only
        </p>
      </motion.div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-rosegold/40"
      />
    </label>
  );
}
