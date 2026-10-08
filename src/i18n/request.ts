import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const jar = await cookies();
  const raw = jar.get("NEXT_LOCALE")?.value;
  const locale = raw === "en" ? "en" : "pt";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
