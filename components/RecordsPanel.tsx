"use client";

import { useState } from "react";
import { iconBackground, metaFor, TAB_SECTIONS, truncateValue } from "@/lib/records";
import type { RecordGroup, SipRecord } from "@/lib/types";
import { RecordIcon } from "./RecordIcon";

const TABS: { id: "all" | RecordGroup; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pay", label: "Pay" },
  { id: "key", label: "Keys" },
  { id: "link", label: "Links" },
];

function RecordRow({ record }: { record: SipRecord }) {
  const meta = metaFor(record);
  const joined = record.value.join(", ");
  const href = meta.href ? meta.href(record.value[0]) : null;
  return (
    <div className="rec">
      <span className="ic" style={{ background: iconBackground(meta) }}>
        <RecordIcon name={meta.icon} />
      </span>
      <span className="rec-tx">
        <span className="rn">{meta.label}</span>
        {meta.description ? <span className="rd">{meta.description}</span> : null}
      </span>
      <span className="rv">{truncateValue(joined)}</span>
      {href ? (
        <a className="recbtn" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${meta.label}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M17 7H8M17 7v9" />
          </svg>
        </a>
      ) : (
        <CopyRec value={joined} label={meta.label} />
      )}
    </div>
  );
}

function CopyRec({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="recbtn"
      aria-label={copied ? "Copied" : `Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="11" height="11" rx="2.5" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
    </button>
  );
}

export function RecordsPanel({ records, titlePrefix = "" }: { records: SipRecord[]; titlePrefix?: string }) {
  const [tab, setTab] = useState<"all" | RecordGroup>("all");
  const tagged = records.map((r) => ({ r, g: metaFor(r).group }));
  const visible = tab === "all" ? tagged : tagged.filter((t) => t.g === tab);

  return (
    <div className="recpanel">
      <div className="rechead">
        <div className="rectabs" role="tablist" aria-label="Filter records">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`rectab${tab === t.id ? " on" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {TAB_SECTIONS.map((sec) => {
        const rows = visible.filter((t) => sec.groups.includes(t.g));
        if (!rows.length) return null;
        return (
          <div className="recsec" key={sec.title}>
            <p className="recsec-h">{titlePrefix ? `${titlePrefix}${sec.title}` : sec.title}</p>
            <div className="recgroup">
              {rows.map((row, i) => (
                <RecordRow key={`${row.r.key}-${i}`} record={row.r} />
              ))}
            </div>
          </div>
        );
      })}
      {visible.length === 0 ? <p className="recempty">No {tab} records.</p> : null}
    </div>
  );
}
