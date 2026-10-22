"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface Props {
  className?: string;
  // Keep the spinner's footprint while idle to avoid layout shift (e.g. nav items).
  reserveSpace?: boolean;
}

// Must be rendered as a descendant of a <Link>.
export function LinkPendingIndicator({ className, reserveSpace = false }: Props) {
  const { pending } = useLinkStatus();
  if (!pending && !reserveSpace) return null;
  return <Spinner className={cn(className, !pending && "invisible")} />;
}
