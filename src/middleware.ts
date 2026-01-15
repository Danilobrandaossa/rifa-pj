import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/esqueceu-senha" ||
    pathname === "/nova-senha"

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin))
  }

  if (isLoggedIn && (isAuthRoute || pathname === "/")) {
    return NextResponse.redirect(new URL("/rifas", req.nextUrl.origin))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
