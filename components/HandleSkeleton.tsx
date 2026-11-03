import { avatarGradient, initials } from "@/lib/parse";

export function HandleSkeleton({ handle }: { handle: string }) {
  return (
    <div className="phandle" aria-busy="true" aria-live="polite">
      <div className="pcols">
        <aside className="side">
          <div className="sidecard">
            <div className="av" style={{ background: avatarGradient(handle) }}>
              {initials(handle)}
            </div>
            <div className="rhandle">{handle}</div>
            <p className="status resolving">
              <span className="spinner" aria-hidden="true" />
              <b>Resolving…</b>
            </p>
            <div className="trust">
              <dl className="trust-list">
                <div className="trust-row">
                  <dt>Public key</dt>
                  <dd>
                    <span className="sk sk-line" style={{ width: 140 }} />
                  </dd>
                </div>
                <div className="trust-row">
                  <dt>Anchored</dt>
                  <dd>
                    <span className="sk sk-line" style={{ width: 90 }} />
                  </dd>
                </div>
              </dl>
            </div>
            <div className="cardactions">
              <span className="sk sk-line" style={{ width: 48 }} />
              <span className="sk sk-line" style={{ width: 48 }} />
            </div>
          </div>
        </aside>
        <div className="main">
          <div className="recskel" aria-hidden="true">
            <span className="sk sk-tabs" />
            <span className="sk sk-sec" />
            <span className="sk sk-row" />
            <span className="sk sk-row" />
            <span className="sk sk-sec" />
            <span className="sk sk-row" />
            <span className="sk sk-row" />
          </div>
        </div>
      </div>
    </div>
  );
}
