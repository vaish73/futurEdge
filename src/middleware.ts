// middleware.ts
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Allow onboarding access for authenticated users
  if (url.pathname === "/dashboard") {
      if (!token) {
          return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      return NextResponse.next();
  }

  // Protect dashboard routes
  if (url.pathname.startsWith("/dashboard")) {
      if (!token) {
          return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      else {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
  }
  return NextResponse.next();
}