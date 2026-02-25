import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("taskmanager_access_token")?.value;
  const { pathname } = request.nextUrl;

  // If on login page with token, redirect to dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Note: Main auth check is client-side via localStorage + Zustand.
  // This middleware handles cookie-based redirect for SSR pages if needed.

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/(dashboard)/:path*"],
};
