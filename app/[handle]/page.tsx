import { Suspense } from "react";
import { CopyButton, CopyChip, ShareButton } from "@/components/CopyChip";
import { HandleSkeleton } from "@/components/HandleSkeleton";
import { TryAgainButton } from "@/components/TryAgainButton";
import { PayBlock } from "@/components/PayBlock";
import { RecordsPanel } from "@/components/RecordsPanel";
import { lookupHandle } from "@/lib/lookup";
import { avatarGradient, formatAnchor, initials, isValidHandle, normalizeQuery, shorten } from "@/lib/parse";
import { siteName } from "@/lib/site";
import type { Metadata } from "next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const q = decodeURIComponent(handle);
  return { title: `${q} · ${siteName()}` };
}

export default async function HandlePage({ params }: Props) {
  const { handle: raw } = await params;
  const handle = normalizeQuery(raw);

  if (!handle || !isValidHandle(handle)) {
    return (
      <div className="phandle">
        <div className="nfcard">
          <div className="av" style={{ background: avatarGradient(handle || "??") }}>
            {initials(handle || "??")}
          </div>
          <div className="rhandle">{handle || raw}</div>
          <div className="eh">That isn’t a handle</div>
          <p className="ed">Handles look like name@example — e.g. grace@key.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<HandleSkeleton handle={handle} />}>
      <HandleResult handle={handle} />
    </Suspense>
  );
}

async function HandleResult({ handle }: { handle: string }) {
  const profile = await lookupHandle(handle);

  if (!profile.found) {
    return (
      <div className="phandle">
        <div className="nfcard">
          <div className="av" style={{ background: avatarGradient(profile.handle) }}>
            {initials(profile.handle)}
          </div>
          <div className="rhandle">{profile.handle}</div>
          <div className="eh">Could be available</div>
          <p className="ed">
            We couldn’t find this handle. It may be unregistered, or the relay has not seen it yet.
            {profile.error ? ` ${profile.error}` : ""}
          </p>
          <TryAgainButton />
        </div>
      </div>
    );
  }

  const anchored = formatAnchor(profile.anchor);

  return (
    <div className="phandle">
      <div className="pcols">
        <aside className="side">
          <div className="sidecard">
            <div className="av" style={{ background: avatarGradient(profile.handle) }}>
              {initials(profile.handle)}
            </div>
            <div className="rhandle">{profile.handle}</div>
            {profile.sovereign ? (
              <p className="status">
                <svg className="seal" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 .8 9.8 2 12 1.7l.9 2 2 .9-.3 2.2L15.8 8l-1.2 1.2.3 2.2-2 .9-.9 2-2.2-.3L8 15.2 6.8 14l-2.2.3-.9-2-2-.9.3-2.2L.8 8 2 6.8l-.3-2.2 2-.9.9-2L6.8 2 8 .8Zm3.1 5.1a.7.7 0 0 0-1 0L7.2 8.8 5.9 7.5a.7.7 0 1 0-1 1l1.8 1.8c.3.3.7.3 1 0l3.4-3.4a.7.7 0 0 0 0-1Z" />
                </svg>
                <b>Sovereign</b>
              </p>
            ) : profile.sovereignty ? (
              <p className="status">
                <b>{profile.sovereignty}</b>
              </p>
            ) : null}
            <div className="trust">
              <dl className="trust-list">
                {profile.script_pubkey ? (
                  <div className="trust-row">
                    <dt>Public key</dt>
                    <dd>
                      <CopyChip value={profile.script_pubkey} display={shorten(profile.script_pubkey)} />
                    </dd>
                  </div>
                ) : null}
                {profile.num_id ? (
                  <div className="trust-row">
                    <dt>Num id</dt>
                    <dd>
                      <CopyChip value={profile.num_id} display={shorten(profile.num_id)} />
                    </dd>
                  </div>
                ) : null}
                {profile.alias ? (
                  <div className="trust-row">
                    <dt>Alias</dt>
                    <dd>{profile.alias}</dd>
                  </div>
                ) : null}
                {anchored ? (
                  <div className="trust-row">
                    <dt>Anchored</dt>
                    <dd>{anchored}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            {profile.payUri ? (
              <PayBlock
                payUri={profile.payUri}
                payLabel={profile.payLabel ?? "Pay"}
                qr={profile.payQr}
                isBolt12={profile.isBolt12}
              />
            ) : null}
            <div className="cardactions">
              <CopyButton value={profile.handle} label="Copy handle" />
              <ShareButton title={profile.handle} />
            </div>
          </div>
        </aside>
        <div className="main">
          <RecordsPanel records={profile.records} />
          {profile.spacedEnabled && profile.fallback_records.length ? (
            <>
              <p className="fb-h">On-chain fallback</p>
              <RecordsPanel records={profile.fallback_records} />
            </>
          ) : null}
          <div className="mainfoot">
            <p className="pnote">
              {profile.spacedEnabled
                ? "Records were resolved with fabric against certrelay and checked against this host’s spaced node when it was reachable."
                : "Only certrelays were queried. Additional information may be available on-chain."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
