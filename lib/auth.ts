import { redirect } from "next/navigation";
import { createAuthClient } from "./supabase/server";

export async function requireOwner() {
  const supabase = await createAuthClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const { data: staff, error: roleError } = await supabase.from("staff_members")
    .select("role,active").eq("user_id", user.id).maybeSingle();
  if (roleError) throw new Error("Semakan akses HQ gagal. Cuba lagi.");
  if (!user.email_confirmed_at || !staff?.active || staff.role !== "owner") redirect("/admin/access");
  return { supabase, user };
}
