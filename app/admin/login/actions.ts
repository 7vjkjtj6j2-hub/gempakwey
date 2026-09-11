"use server";
import { redirect } from "next/navigation";
import { createAuthClient } from "../../../lib/supabase/server";

export async function login(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || email.length > 254 || !password || password.length > 1024) redirect("/admin/login?error=credentials");
  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=credentials");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error("Log keluar gagal. Cuba lagi.");
  redirect("/admin/login");
}
