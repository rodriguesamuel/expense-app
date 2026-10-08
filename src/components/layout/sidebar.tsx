"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: t("dashboard"), icon: "📊" },
    { href: "/expenses", label: t("expenses"), icon: "💸" },
    { href: "/payment-types", label: t("paymentTypes"), icon: "💳" },
    { href: "/reports", label: t("reports"), icon: "📈" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 min-h-screen">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-blue-600">💰 {t("appName")}</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span>🚪</span>
            {t("signOut")}
          </button>
        </form>
      </div>
    </aside>
  );
}
