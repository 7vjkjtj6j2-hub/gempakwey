import { login } from "./actions";
import { Submit } from "../submit";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return <section className="card narrow"><small>HQ CONTROL CENTRE</small><h1>Log masuk HQ</h1><p>Urus katalog Heritage melalui akaun staf yang diluluskan.</p>
    {!configured ? <p role="alert" className="notice error">Sambungan Supabase belum disediakan untuk deployment ini.</p> : <>
    {error && <p role="alert" className="notice error">Login tidak berjaya. Semak email, kata laluan dan pengesahan akaun, kemudian cuba lagi.</p>}
    <form action={login}><label>Email<input name="email" type="email" autoComplete="username" required maxLength={254}/></label><label>Kata laluan<input name="password" type="password" autoComplete="current-password" required maxLength={1024}/></label><Submit>Log masuk</Submit></form>
    <p><small>Akaun HQ perlu disediakan oleh pentadbir terlebih dahulu. Tiada pendaftaran staf secara terbuka.</small></p></>}
  </section>;
}
