import BookingForm from "../../components/BookingForm";

export default function Page() {
  return (
    <main className="portal-page">
      <section className="portal-content narrow-content">
        <a className="back-link" href="/">← Back to FixFlow</a>
        <div className="page-heading">
          <span className="eyebrow">SERVICE REQUEST</span>
          <h1>Tell us what needs fixing</h1>
          <p>A FixFlow client account is required to submit and track a request.</p>
        </div>
        <BookingForm />
      </section>
    </main>
  );
}
