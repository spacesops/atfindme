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
        <div className="fattr">
          <p>
            {name} looks up any Spaces protocol name via the public certrelay mesh (and
            optional on-chain data when configured).
          </p>
          <p>
            To register or acquire a name such as @findme or any other handle, use the{" "}
            <a href="https://spaceswallet.com/" target="_blank" rel="noopener noreferrer">
              Spaces Wallet
            </a>{" "}
            mobile app.
          </p>
          <p>
            Profile layout and record presentation inspired by{" "}
            <a href="https://nacho.io/" target="_blank" rel="noopener noreferrer">
              nacho.io
            </a>{" "}
            and its authors.
          </p>
        </div>
      </footer>
    </div>
  );
}
