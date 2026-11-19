import { ArrowRight, Check, Compass } from 'lucide-react'

const steps = [
  ['01', 'Make your page yours', 'Choose a handle, write a short introduction and add the links visitors need most.'],
  ['02', 'Share what you make', 'Publish articles, videos, podcasts and useful updates from one creator workspace.'],
  ['03', 'Grow at your own pace', 'Invite visitors to subscribe and list digital products when you are ready.'],
]

const questions = [
  ['Can I start without selling anything?', 'Yes. Begin with a public profile and links. Newsletter sign-ups and product listings are optional.'],
  ['Do I need a separate website?', 'No. Your CreatorHub page gives visitors a single place to find your work. You can still link to your existing website and social channels.'],
  ['Does the Vite preview accept payments?', 'No. The Vite edition demonstrates the public experience. Paystack checkout is connected through the Express API in the Next.js edition.'],
]

function CreatorHomeMore() {
  return (
    <>
      <section className="creator-home-more">
        <div className="creator-section-heading"><span className="creator-eyebrow">HOW IT FITS TOGETHER</span><h2>A home for the work, not another complicated stack.</h2><p>Start with the page you need today. Add the pieces that make sense for your audience over time.</p></div>
        <div className="creator-home-steps">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="creator-home-community">
        <div><span className="creator-eyebrow">MADE FOR DIFFERENT KINDS OF WORK</span><h2>One page can bring many creative paths together.</h2><p>Share a portfolio, a newsletter, an episode, a new collection or the digital tools you have made.</p><a className="creator-button creator-button-primary" href="/creators">Explore creator pages <Compass size={15} /></a></div>
        <ul><li><Check size={15} /> Independent writers and educators</li><li><Check size={15} /> Designers, photographers and illustrators</li><li><Check size={15} /> Musicians, podcasters and video makers</li><li><Check size={15} /> Small studios and creative teams</li></ul>
      </section>
      <section className="creator-home-faq">
        <div className="creator-section-heading"><span className="creator-eyebrow">GOOD TO KNOW</span><h2>Before you get started</h2><p>A few common questions about setting up and using CreatorHub.</p></div>
        <div className="creator-faq-list">{questions.map(([question, answer]) => <details key={question}><summary><span>{question}</span><ArrowRight size={15} /></summary><p>{answer}</p></details>)}</div>
        <a className="creator-home-faq-link" href="/help">Visit the help center <ArrowRight size={14} /></a>
      </section>
    </>
  )
}

export default CreatorHomeMore
