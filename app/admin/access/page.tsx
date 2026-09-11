import { redirect } from "next/navigation";
import { createAuthClient } from "../../../lib/supabase/server";
import { logout } from "../login/actions";
export default async function Access() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return <section className="card narrow"><h1>Akses belum aktif</h1><p>Akaun {user.email} belum mempunyai akses owner HQ yang aktif dan disahkan. Hubungi pentadbir untuk semakan.</p><form action={logout}><button>Log keluar</button></form></section>;
}
