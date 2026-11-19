import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, UsersRound } from 'lucide-react'
import teamPhoto from '../assets/Care team photography.png'
import HomeHeader from '../components/HomeHeader'
import HomeFooter from '../components/HomeFooter'
import './CarewellAboutPage.css'

const commitments = [
  {
    icon: HeartHandshake,
    title: 'Care that feels personal',
    description: 'We help you find clinicians who listen, explain your options, and treat you as a whole person.',
  },
  {
    icon: BadgeCheck,
    title: 'Confidence in your care',
    description: 'Clear provider profiles and practical information help you make informed choices at every step.',
  },
  {
    icon: ShieldCheck,
    title: 'Your privacy matters',
    description: 'We design every interaction with respect for your personal information and your time.',
  },
]

function CarewellAboutPage() {
  return (
    <div className="carewell-info-page carewell-about-page">
      <HomeHeader />
      <main>
        <section className="about-hero">
          <div className="about-hero-copy">
            <a className="info-breadcrumb" href="/">Home <span>/</span> About Carewell</a>
            <span className="info-eyebrow">CARE, WITH YOU IN MIND</span>
            <h1>Better health starts with feeling understood.</h1>
            <p>Carewell makes it easier to find a doctor who fits your needs, ask the right questions, and take your next step with confidence.</p>
            <a className="info-primary-link" href="/doctors">Meet our doctors <ArrowRight size={16} /></a>
          </div>
          <div className="about-hero-image">
            <img src={teamPhoto} alt="A team of welcoming Carewell doctors" />
            <div className="about-image-note"><UsersRound size={18} /><span><strong>A care team you can trust</strong><small>Here for every step of your journey</small></span></div>
          </div>
        </section>

        <section className="about-story info-section">
          <div className="about-section-label"><span>OUR PURPOSE</span><h2>Making good care easier to find.</h2></div>
          <div className="about-story-copy">
            <p>Finding healthcare can feel like one more thing to manage when you already have a lot on your mind. We created Carewell to make that first step simpler and more human.</p>
            <p>Our goal is to connect people with trusted providers through clear information and a straightforward appointment-request experience. You stay in control of choosing the care that feels right for you.</p>
          </div>
        </section>

        <section className="about-commitments">
          <div className="info-section-heading">
            <span className="info-eyebrow">WHAT GUIDES US</span>
            <h2>Care should work for real life.</h2>
            <p>Thoughtful tools, trusted information, and a more personal path to care.</p>
          </div>
          <div className="commitment-grid">
            {commitments.map(({ icon: Icon, title, description }) => (
              <article className="commitment-card" key={title}>
                <span><Icon size={20} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-next-step" id="reviews">
          <div><span className="info-eyebrow">YOUR HEALTH JOURNEY, YOUR WAY</span><h2>Ready to find care that feels right?</h2><p>Explore local specialists and choose the provider you would like to contact.</p></div>
          <a className="info-primary-link" href="/book-now">Find a doctor <ArrowRight size={16} /></a>
        </section>
      </main>
      <HomeFooter />
    </div>
  )
}

export default CarewellAboutPage
