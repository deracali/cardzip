import { ArrowRight, BookOpen, HeartHandshake, ShieldCheck, Users } from 'lucide-react'

const info: Record<string, { eyebrow: string; title: string; intro: string; cards: [string, string][] }> = {
  about: { eyebrow: 'OUR SCHOOL', title: 'A place to become yourself.', intro: 'Greenfield College is a welcoming, ambitious school where every learner is known and encouraged to do meaningful work.', cards: [['Our mission', 'Help every student grow into a capable, compassionate, and curious person.'], ['Our community', 'Students, families, educators, and neighbors learn from one another.'], ['Our promise', 'Safe spaces, high expectations, and support that meets each student where they are.']] },
  academics: { eyebrow: 'LEARNING AT GREENFIELD', title: 'Find your spark. Build your skills.', intro: 'A broad, connected curriculum lets students explore deeply, practice boldly, and see how learning matters beyond school.', cards: [['Junior secondary', 'Strong foundations in literacy, numeracy, science, technology, and the arts.'], ['Senior secondary', 'Focused subject pathways, project work, and preparation for the next step.'], ['Learning support', 'Guidance, tutoring, and student wellbeing support designed around individual needs.']] },
  'campus-life': { eyebrow: 'LIFE TOGETHER', title: 'A school day full of possibility.', intro: 'Friendships, clubs, sport, service, and creative work make school a place to belong as well as a place to learn.', cards: [['Clubs & creativity', 'Join music, debate, coding, arts, and student-led interest groups.'], ['Sport & wellbeing', 'Build healthy habits, teamwork, and confidence through active programs.'], ['Community service', 'Put learning into action through projects with local partners.']] },
}

export function InfoPage({ page }: { page: 'about' | 'academics' | 'campus-life' }) {
  const content = info[page]
  const icons = [BookOpen, Users, HeartHandshake]
  return <main className="subpage"><section className="subpage-hero"><span className="eyebrow">{content.eyebrow}</span><h1>{content.title}</h1><p>{content.intro}</p></section><section className="info-card-grid">{content.cards.map(([title, copy], index) => { const Icon = icons[index]; return <article key={title}><Icon size={22}/><h2>{title}</h2><p>{copy}</p></article> })}</section><div className="info-callout"><ShieldCheck size={20}/><p>Every student deserves a safe, encouraging place to learn and grow.</p><a className="button button-navy" href="/admissions">Join our community <ArrowRight size={15}/></a></div></main>
}
