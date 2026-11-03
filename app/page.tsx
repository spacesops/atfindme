import { HandleSearch } from "@/components/HandleSearch";
import { siteName } from "@/lib/site";

export default function HomePage() {
  const name = siteName();
  return (
    <div className="home">
      <h1>Find them here</h1>
      <p className="lede">
        {name} is the list a person can point their followers to when every other
        channel might be taken away.
      </p>
      <HandleSearch />
      <div className="examples">
        <a href="/andrew%40lunde">andrew@lunde</a>
        <a href="/grace%40key">grace@key</a>
      </div>

      <article className="rationale">
        <h2>Why this exists</h2>
        <p>
          Social platforms are not a reliable address book. Accounts get locked,
          renamed, shadowbanned, or deleted. When that happens, people who actually
          know you are left guessing which remaining profile is real. {name} exists
          so a user can publish the authoritative list of ways to reach them — every
          social handle, payment address, website, and note they choose to attach to
          their Spaces name — and so followers have one place to look when they
          suspect that person has been cancelled.
        </p>
        <p>
          The records are not stored in a company database. They are obtained both
          from a mesh network of certrelay servers and from information embedded on
          the Bitcoin blockchain itself. The mesh is how this site resolves a handle
          quickly. The chain is how the same facts survive if any relay, host, or
          government would rather they disappear. There is no central authority that
          can modify, cancel, or obstruct what was published.
        </p>
        <p>
          Only the holder of the private key can change the list. If you still
          control the key, you still control the record. If you follow someone and
          their usual accounts go dark, look them up here. If they still hold their
          key, this is where you will be able to find them.
        </p>
        <p>
          The code for this website is open source. Do not take any one instance
          as gospel. Check the other instances listed above — they all retrieve
          records the same way — and confirm that no particular site has been
          compromised. Relays can lag, so you may see short propagation
          discrepancies, but the data from multiple instances should largely
          correlate.
        </p>
      </article>
    </div>
  );
}
