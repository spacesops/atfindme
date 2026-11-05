/** True when the client asked for JSON via ?format=json or Accept. */

function qFor(accept: string, names: string[]): number {
  let best = 0;
  let seen = false;
  for (const part of accept.split(",")) {
    const [rawType, ...params] = part.trim().split(";");
    const type = rawType.trim().toLowerCase();
    if (!names.includes(type)) continue;
    seen = true;
    const qParam = params.find((p) => p.trim().startsWith("q="));
    const q = qParam ? Number(qParam.trim().slice(2)) : 1;
    if (Number.isFinite(q) && q > best) best = q;
  }
  return seen ? best : 0;
}

export function wantsJson(url: URL, acceptHeader: string | null): boolean {
  const format = url.searchParams.get("format")?.trim().toLowerCase();
  if (format === "json") return true;
  if (format === "html") return false;
  const accept = acceptHeader?.trim() ?? "";
  if (!accept) return false;
  const json = qFor(accept, ["application/json"]);
  if (json <= 0) return false;
  const html = qFor(accept, ["text/html", "application/xhtml+xml"]);
  return json >= html;
}
