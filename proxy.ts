import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("studyflow_session")?.value;
  const { pathname } = request.nextUrl;

  // Protected paths requiring auth
  const protectedPaths = ["/", "/planner", "/tasks", "/timer", "/notes", "/analytics"];
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prevent authenticated users from going to /login
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
