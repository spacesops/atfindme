"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export function HandleSearch({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim().toLowerCase();
    if (!q) return;
    startTransition(() => {
      router.push(`/${encodeURIComponent(q)}`);
    });
  }

  return (
    <form className="psearch" role="search" autoComplete="off" onSubmit={onSubmit} aria-busy={pending}>
      {pending ? (
        <span className="spinner search-spin" aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )}
      <input
        type="search"
        placeholder="Look up a handle"
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        aria-label="Look up a handle"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
