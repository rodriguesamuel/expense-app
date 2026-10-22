"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { logout } from "@/actions/auth";
import { Spinner } from "@/components/ui/spinner";

function SubmitButton() {
  const t = useTranslations("nav");
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 disabled:opacity-60 transition-colors"
    >
      {pending ? <Spinner /> : <span>🚪</span>}
      {t("signOut")}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <SubmitButton />
    </form>
  );
}
