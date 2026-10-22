import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const TIME_ZONE = "America/Sao_Paulo";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocaleConfig(locale: string) {
  return locale === "en"
    ? { intlLocale: "en-US", currency: "USD" }
    : { intlLocale: "pt-BR", currency: "BRL" };
}

export function formatCurrency(amount: number, locale = "pt-BR", currency = "BRL") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string, locale = "pt-BR") {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function monthStartISO(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0];
}

export function monthEndISO(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
}
