export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>Looks like this page took a detour.</h1>
      <p>The link may be outdated, or the page may have moved.</p>
      <a className="button" href="/">
        Back to home <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}
