export default function Home() {
  return (
    <div className="page">
      <header>
        <a className="wordmark" href="/" aria-label="Gempakwey — halaman utama">GEMPAKWEY<span>®</span></a>
        <span className="edition">BRAND STORE / 001</span>
      </header>
      <main>
        <div className="intro"><span className="label">MEMPERKENALKAN</span><span className="line" /></div>
        <h1>HERITAGE<span className="asterisk" aria-hidden="true">*</span></h1>
        <div className="details">
          <p className="statement">Gaya sendiri.<br />Cerita kita.</p>
          <div className="launch"><span className="pill">AKAN DATANG</span><p>Kedai pertama dalam keluarga Gempakwey.<br />Koleksi baju, topi dan banyak lagi.</p><p className="note">Pembelian belum dibuka.</p></div>
        </div>
      </main>
      <footer><span>HERITAGE / GEMPAKWEY</span><span>Bab pertama. Bermula di sini.</span></footer>
    </div>
  );
}
