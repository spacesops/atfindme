"use client";

import { useState } from "react";
import { RecordIcon } from "./RecordIcon";

export function PayBlock({
  payUri,
  payLabel,
  qr,
  isBolt12,
}: {
  payUri: string;
  payLabel: string;
  qr?: string;
  isBolt12?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="payrow">
        <a className="pay" href={payUri}>
          <span className="bi">
            <RecordIcon name={isBolt12 ? "zap" : "bitcoin"} size={16} />
          </span>
          {payLabel}
        </a>
        {qr ? (
          <button
            type="button"
            className={`payqr-btn${open ? " on" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Hide QR code" : "Show QR code"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="5" height="5" rx="1" />
              <rect x="16" y="3" width="5" height="5" rx="1" />
              <rect x="3" y="16" width="5" height="5" rx="1" />
              <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            </svg>
          </button>
        ) : null}
      </div>
      {open && qr ? (
        <div className="scancard">
          <div className="scan-top">
            <span className="scan-lab">Scan to pay</span>
            {isBolt12 ? <span className="scan-badge">BOLT12</span> : null}
          </div>
          <div className="scan-qr">
            <img src={qr} alt="Payment QR code" />
          </div>
        </div>
      ) : null}
    </>
  );
}
