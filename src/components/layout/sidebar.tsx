"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";
import { LinkPendingIndicator } from "@/components/ui/link-pending-indicator";

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: t("dashboard"), icon: "📊" },
    { href: "/expenses", label: t("expenses"), icon: "💸" },
    { href: "/payment-types", label: t("paymentTypes"), icon: "💳" },
    { href: "/categories", label: t("categories"), icon: "🏷️" },
    { href: "/budgets", label: t("budgets"), icon: "🎯" },
    { href: "/reports", label: t("reports"), icon: "📈" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">💰 {t("appName")}</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            )}
          >
            <span>{icon}</span>
            {label}
            <LinkPendingIndicator className="ml-auto" reserveSpace />
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        <LogoutButton />
      </div>
    </aside>
  );
}
