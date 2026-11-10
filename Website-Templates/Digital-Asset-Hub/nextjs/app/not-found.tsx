export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow">404 · PAGE NOT FOUND</span>
      <h1>This page took a wrong turn.</h1>
      <p>The page doesn’t exist or has moved.</p>
      <a className="button button-green" href="/">
        Return home
      </a>
    </main>
  );
}
