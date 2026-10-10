"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { requestPasswordReset, confirmPasswordReset } from "@/actions/auth";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const isConfirm = searchParams.has("code");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      if (isConfirm) {
        const result = await confirmPasswordReset(formData);
        if (result?.error) setError(result.error);
      } else {
        const result = await requestPasswordReset(formData);
        if (result?.error) setError(result.error);
        if (result && "success" in result && result.success) setSuccess(result.success);
      }
    });
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl shadow-md p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {isConfirm ? t("setNewPassword") : t("resetPassword")}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          {t("backToSignIn")}
        </Link>
      </p>

      {success ? (
        <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 rounded-lg px-4 py-3">
          {success}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {isConfirm ? (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("newPassword")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {isPending
              ? t("sending")
              : isConfirm
              ? t("setNewPassword")
              : t("sendResetLink")}
          </button>
        </form>
      )}
    </div>
  );
}
