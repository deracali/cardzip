export default function NotFound() {
  return (
    <main className="not-found">
      <a className="brand" href="/" aria-label="NOVA Studio home">
        <img src="/favicon.svg" alt="" />
        <span className="brand-copy">
          <strong>NOVA Studio</strong>
          <small>CREATIVE AGENCY</small>
        </span>
      </a>
      <h1>That page isn’t here.</h1>
      <p>Explore NOVA Studio’s work and services instead.</p>
      <a className="button button-cyan" href="/">
        Back to NOVA Studio <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}
