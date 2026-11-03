import { Suspense } from "react";
import { siteName } from "@/lib/site";
import { DirectoryLinks, DirectoryPending } from "./DirectoryLinks";
import { HandleSearch } from "./HandleSearch";

export function Chrome({ children }: { children: React.ReactNode }) {
  const name = siteName();
  return (
    <div className="lp">
      <div className="bg" aria-hidden="true">
        <div className="glow" />
        <div className="dots" />
      </div>
      <nav>
        <div className="navinner">
          <a className="logo" href="/" aria-label={name}>
            <span className="mark" />
            {name}
          </a>
          <HandleSearch />
          <Suspense fallback={<DirectoryPending />}>
            <DirectoryLinks />
          </Suspense>
        </div>
      </nav>
      <main>{children}</main>
      <footer>
        <div className="fin">
          <p>{name} — handles on the Spaces protocol</p>
          <div className="fl">
            <a href="/">Home</a>
            <a href="https://spacesprotocol.org" target="_blank" rel="noopener noreferrer">
              Spaces protocol
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
