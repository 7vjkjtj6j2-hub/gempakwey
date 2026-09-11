"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section className="card"><h1>Sambungan terganggu</h1><p>Maklumat HQ tidak dapat dimuatkan. Sila cuba semula.</p><button onClick={reset}>Cuba semula</button></section>;
}
