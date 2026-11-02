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
  const date = new Date();
  return formatLocalISODate(date);
}

export function monthStartISO(date = new Date()) {
  return formatLocalISODate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function monthEndISO(date = new Date()) {
  return formatLocalISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function addMonthsISO(dateStr: string, months: number, day: number) {
  const [year, month] = dateStr.split("-").map(Number);
  const target = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return formatLocalISODate(target);
}

export function calculatePaymentDates(
  purchaseDate: string,
  cutoffDay: number,
  dueDay: number,
  installmentCount: number
) {
  const purchaseDay = Number(purchaseDate.slice(8, 10));
  const firstMonthOffset = purchaseDay >= cutoffDay ? 1 : 0;
  return Array.from({ length: installmentCount }, (_, index) =>
    addMonthsISO(purchaseDate, firstMonthOffset + index, dueDay)
  );
}

export function splitInstallmentAmounts(total: number, count: number) {
  const totalCents = Math.round(total * 100);
  const baseCents = Math.floor(totalCents / count);
  const amounts = Array.from({ length: count }, () => baseCents);
  amounts[count - 1] += totalCents - baseCents * count;
  return amounts.map((amount) => amount / 100);
}

function formatLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
