import { cookies } from "next/headers";
import { createTranslator } from "next-intl";

export type Locale = "pt" | "en";

export async function getServerLocale(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get("NEXT_LOCALE")?.value;
  return raw === "en" ? "en" : "pt";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadMessages(locale: Locale): Promise<Record<string, any>> {
  return (await import(`../../messages/${locale}.json`)).default;
}

export async function getI18n(namespace: string) {
  const locale = await getServerLocale();
  const messages = await loadMessages(locale);
  const t = createTranslator({ locale, messages, namespace });
  return { t, locale };
}
