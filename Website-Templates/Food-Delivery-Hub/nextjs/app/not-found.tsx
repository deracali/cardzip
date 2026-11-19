export default function NotFound() {
  return (
    <main className="not-found">
      <span className="eyebrow-red">404 · PAGE NOT FOUND</span>
      <h1>Looks like this menu item is unavailable.</h1>
      <p>Head back to the menu and find another favorite.</p>
      <a className="button" href="/">
        Back to Sizzle&Smile <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}
