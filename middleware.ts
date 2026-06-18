import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isPublicInvoicePage = pathname.startsWith("/invoice/");
  const hasToken = request.cookies.has("userAuth");

  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthPage && !isPublicInvoicePage && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
