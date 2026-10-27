"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { type ReactNode } from "react";
import { TIME_ZONE } from "@/lib/utils";

interface Props {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE}>
      {children}
    </NextIntlClientProvider>
  );
}
