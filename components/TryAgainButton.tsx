"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function TryAgainButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function retry() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button type="button" className="tryagain" onClick={retry} disabled={pending} aria-busy={pending}>
      {pending ? (
        <span className="spinner search-spin" aria-hidden="true" />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-2.6-6.3" />
          <path d="M21 3v6h-6" />
        </svg>
      )}
      Try Again
    </button>
  );
}
