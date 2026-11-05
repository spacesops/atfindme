import { lookupHandle, toApiJson } from "@/lib/lookup";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
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
