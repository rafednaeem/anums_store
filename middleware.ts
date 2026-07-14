import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabase, response } = await updateSession(request);

  let user = null;

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    return response;
  }

  const pathname = request.nextUrl.pathname;

  // ── /admin/* routes ──────────────────────────────────────────
  // Require authenticated admin (dual-check: JWT metadata + DB profile)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return Response.redirect(loginUrl);
    }

    // Check JWT metadata first (fast path)
    if (user.app_metadata?.role === "admin") {
      return response;
    }

    // Fallback to database profile check
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile && (profile as { role: string }).role === "admin") {
        return response;
      }
    } catch {
      // Profile check failed - fall through to redirect
    }

    // Non-admin authenticated user trying to access admin
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("error", "unauthorized");
    return Response.redirect(homeUrl);
  }

  // ── /account/* routes ────────────────────────────────────────
  // Require any authenticated user
  if (pathname.startsWith("/account")) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return Response.redirect(loginUrl);
    }
  }

  // ── /auth/login and /auth/signup routes ──────────────────────
  // Redirect authenticated users to appropriate dashboard
  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup")
  ) {
    if (user) {
      if (user.app_metadata?.role === "admin") {
        return Response.redirect(new URL("/admin", request.url));
      }
      return Response.redirect(new URL("/account", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/auth/:path*"],
};
