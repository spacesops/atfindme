import { lookupHandle, toApiJson } from "@/lib/lookup";
import { decodeHandleSegment } from "@/lib/wants-json";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function queryFromRequest(req: NextRequest): string {
  const fromQuery = req.nextUrl.searchParams.get("q");
  if (fromQuery?.trim()) return decodeHandleSegment(fromQuery);
  const fromHeader = req.headers.get("x-atfindme-q");
  if (fromHeader?.trim()) return decodeHandleSegment(fromHeader);
  const path = req.nextUrl.pathname.replace(/^\//, "");
  if (path && path !== "api/resolve" && !path.startsWith("api/")) {
    return decodeHandleSegment(path);
  }
  return "";
}

export async function GET(req: NextRequest) {
  const q = queryFromRequest(req);
  if (!q) {
    return json({ error: "invalid" }, 400);
  }
  const profile = await lookupHandle(q);
  const body = toApiJson(profile);
  if (!profile.valid) {
    return json(body, 400);
  }
  if (profile.error) {
    return json(body, 503);
  }
  if (!profile.found) {
    return json(body, 404);
  }
  return json(body, 200);
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { vary: "Accept" },
  });
}
