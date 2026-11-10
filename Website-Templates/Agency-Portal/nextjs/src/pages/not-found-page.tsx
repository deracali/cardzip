import { Brand } from "../components/Shared";

export function NotFound() {
  return (
    <main className="not-found">
      <Brand />
      <h1>That page isn’t here.</h1>
      <p>Explore NOVA Studio’s work and services instead.</p>
      <a className="button button-cyan" href="/">
        Back to NOVA Studio <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}

export default NotFound;
