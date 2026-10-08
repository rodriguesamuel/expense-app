import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function detectLocale(request: NextRequest): "pt" | "en" {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie === "pt" || cookie === "en") return cookie;
  const accept = request.headers.get("accept-language") ?? "";
  const primary = accept.split(",")[0].split("-")[0].toLowerCase();
  return primary === "en" ? "en" : "pt";
}

export async function middleware(request: NextRequest) {
  const locale = detectLocale(request);
  const response = await updateSession(request);
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
