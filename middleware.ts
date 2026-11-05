import { wantsJson } from "@/lib/wants-json";
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }
  if (!wantsJson(request.nextUrl, request.headers.get("accept"))) {
    return NextResponse.next();
  }
  const handle = request.nextUrl.pathname.replace(/^\//, "");
  if (!handle || handle.includes("/")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/api/resolve";
  url.search = "";
  url.searchParams.set("q", handle);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
