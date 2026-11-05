import { connection } from "next/server";
import { listDirectory } from "@/lib/directory";

export async function DirectoryLinks() {
  await connection();
  try {
    const { entries, relay } = await listDirectory();
    const host = relay.replace(/^https?:\/\//, "");
    if (!entries.length) {
      return (
        <div className="dirlist" role="note">
          <span className="dir-err">No directory handles from {host}.</span>
        </div>
      );
    }
    return (
      <div className="dirlist" aria-label={`Directory handles from ${host}`}>
        {entries.map((entry) =>
          entry.website ? (
            <a key={entry.handle} href={entry.website} target="_blank" rel="noopener noreferrer" title={entry.handle}>
              {entry.handle}
            </a>
          ) : (
            <span key={entry.handle} className="dir-err" title={entry.error ?? undefined}>
              {entry.error ?? `${entry.handle}: no website`}
            </span>
          ),
        )}
      </div>
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[directory]", msg);
    return (
      <div className="dirlist" role="alert">
        <span className="dir-err">Could not load directory listing.</span>
      </div>
    );
  }
}

export function DirectoryPending() {
  return (
    <div className="dirlist" aria-busy="true">
      <span className="spinner search-spin" aria-hidden="true" />
      <span className="dir-pending">Looking up directory…</span>
    </div>
  );
}
