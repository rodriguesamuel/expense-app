import { z } from "zod";

export function createCategorySchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t("nameRequired")).max(100),
  });
}
