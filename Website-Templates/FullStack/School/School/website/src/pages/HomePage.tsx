import { ArrowRight, BookOpen, CalendarDays, GraduationCap, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'

const pillars = [
  { icon: BookOpen, title: 'Learn with purpose', copy: 'A challenging, joyful curriculum that helps every learner find their strengths.' },
  { icon: HeartHandshake, title: 'Grow together', copy: 'A welcoming community where belonging, empathy, and confidence matter.' },
  { icon: Sparkles, title: 'Make an impact', copy: 'Students turn ideas into projects that serve their community and shape tomorrow.' },
]

export function HomePage() {
  return <main>
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow"><span /> WELCOME TO GREENFIELD</span><h1>A bright start<br />to a <em>bold future.</em></h1><p>We help students become thoughtful leaders, confident learners, and caring members of their community.</p><div className="hero-buttons"><a className="button button-gold" href="/admissions">Explore admissions <ArrowRight size={16} /></a><a className="button button-outline" href="/about">Discover Greenfield</a></div><div className="hero-trust"><span><ShieldCheck size={16} /> Safe, supportive campus</span><span><GraduationCap size={16} /> Learning for life</span></div></div>
      <div className="hero-art" role="img" aria-label="Students learning together in class"><div className="art-circle" /><div className="art-card"><span>G</span><div><b>Curiosity lives here.</b><small>Greenfield College · Est. 1998</small></div></div><div className="art-note"><span>98%</span><small>of learners feel<br />they belong</small></div><div className="art-sun" /></div>
    </section>
    <section className="welcome-strip"><span>ROOTED IN COMMUNITY</span><b>2,847 learners</b><b>148 teachers</b><b>One welcoming campus</b><a href="/about">Get to know us <ArrowRight size={14} /></a></section>
    <section className="section pillars"><div className="section-heading"><span className="eyebrow">THE GREENFIELD WAY</span><h2>More than a place to learn.</h2><p>We build the confidence, skills, and connections students need to thrive.</p></div><div className="pillar-grid">{pillars.map(({ icon: Icon, title, copy }) => <article key={title}><span className="pillar-icon"><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p><a href="/academics">Learn more <ArrowRight size={14} /></a></article>)}</div></section>
    <section className="section split-section"><div className="split-art"><span>LEARN · LEAD · BELONG</span><strong>Every voice<br />has a place.</strong></div><div><span className="eyebrow">A COMMUNITY THAT CARES</span><h2>Big enough to inspire.<br /><em>Close enough to know you.</em></h2><p>From the first day of school to graduation, our teachers and staff partner with families to help each student find their path.</p><a className="text-link" href="/campus-life">Experience campus life <ArrowRight size={15} /></a></div></section>
    <section className="section news-section"><div className="section-heading"><span className="eyebrow">WHAT'S HAPPENING</span><h2>Life at Greenfield.</h2></div><div className="news-grid"><article><CalendarDays size={18}/><small>12 NOVEMBER 2026</small><h3>Open campus morning</h3><p>Meet our teachers, explore learning spaces, and see a school day in action.</p><a href="/admissions">Plan your visit <ArrowRight size={14}/></a></article><article><GraduationCap size={18}/><small>18 NOVEMBER 2026</small><h3>Senior showcase</h3><p>Students share research, creative work, and community projects.</p><a href="/campus-life">See student life <ArrowRight size={14}/></a></article><article><BookOpen size={18}/><small>24 NOVEMBER 2026</small><h3>Admissions Q&amp;A</h3><p>Get answers about applications, learning support, and school life.</p><a href="/contact">Ask a question <ArrowRight size={14}/></a></article></div></section>
    <section className="cta-section"><div><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Come see what is possible.</h2><p>Visit Greenfield and imagine what your learner can become.</p></div><a className="button button-gold" href="/admissions">Start your application <ArrowRight size={16}/></a></section>
  </main>
}
