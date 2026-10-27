export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryList } from "@/components/categories/category-list";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("categories").select("*").eq("user_id", user.id).order("name");
  return <CategoryList categories={data ?? []} />;
}
