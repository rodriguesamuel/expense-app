"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";

export function MobileHeader() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
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
    <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">💰 {t("appName")}</span>

      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={t("toggleMenu")}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <nav className="w-64 bg-white dark:bg-gray-900 border-r border-transparent dark:border-gray-800 h-full shadow-xl flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">💰 {t("appName")}</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 px-3 py-4 space-y-1">
              {navLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === href || pathname.startsWith(href + "/")
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  )}
                >
                  <span>{icon}</span>
                  {label}
                </Link>
              ))}
            </div>

            <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <span>🚪</span>
                  {t("signOut")}
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
