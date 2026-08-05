import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { FadeUp } from "@/components/love/FadeUp";
import { PageShell } from "@/components/keepsake/PageShell";
import { getKeepsake, saveProfile } from "@/lib/keepsake.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — The Keepsake" },
      { name: "description", content: "Your name, label and birthday inside our Keepsake." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Profile — The Keepsake" },
      { property: "og:description", content: "Your details inside our Keepsake." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const fetchKeepsake = useServerFn(getKeepsake);
  const save = useServerFn(saveProfile);
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ["keepsake"], queryFn: () => fetchKeepsake() });

  const [displayName, setDisplayName] = useState("");
  const [label, setLabel] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    if (!data?.me) return;
    setDisplayName(data.me.display_name ?? "");
    setLabel(data.me.label ?? "");
    setBirthday(data.me.birthday ?? "");
  }, [data?.me]);

  const mutation = useMutation({
    mutationFn: () => save({ data: { displayName, label, birthday } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["keepsake"] }),
  });

  return (
    <PageShell
      eyebrow="Profile"
      title="How you appear here"
      intro="Just the small details — your name, what you like to be called, and your birthday."
    >
      <FadeUp>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="glass-card max-w-lg space-y-5 rounded-[2rem] px-7 py-9 sm:px-10"
        >
          <Field label="Display name" value={displayName} onChange={setDisplayName} />
          <Field label="Label" value={label} onChange={setLabel} placeholder="My love" />
          <Field label="Birthday" value={birthday} onChange={setBirthday} type="date" />

          {mutation.isError && (
            <p className="text-sm text-destructive">Could not save. Please try again.</p>
          )}
          {mutation.isSuccess && (
            <p className="text-sm text-rosegold">Saved ❤</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-glow btn-glow-hover rounded-full px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] disabled:opacity-60"
          >
            {mutation.isPending ? "Saving…" : "Save"}
          </button>
        </form>
      </FadeUp>

      {data?.partner && (
        <FadeUp className="mt-8">
          <div className="glass-card max-w-lg rounded-[2rem] px-7 py-7">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-rosegold">
              Your person
            </p>
            <p className="mt-2 font-serif text-2xl text-ink">
              {data.partner.display_name ?? "Waiting for them to join"}
            </p>
            {data.partner.label && (
              <p className="mt-1 font-serif italic text-rosegold">{data.partner.label}</p>
            )}
          </div>
        </FadeUp>
      )}
    </PageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-sm text-ink outline-none transition-shadow placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-rosegold/40"
      />
    </label>
  );
}
