export default function NotFound() {
  return (
    <main className="not-found">
      <a className="creator-brand" href="/">
        <img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" />
        <span>CreatorHub</span>
      </a>
      <h1>That page isn’t here.</h1>
      <p>Explore CreatorHub and build your own creator page.</p>
      <a className="creator-button creator-button-primary" href="/">
        Back to CreatorHub
      </a>
    </main>
  );
}
