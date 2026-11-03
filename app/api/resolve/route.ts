import { lookupHandle, toApiJson } from "@/lib/lookup";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const profile = await lookupHandle(q);
  return NextResponse.json(toApiJson(profile));
}
