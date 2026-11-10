import { ArrowUpRight, Clock3, Eye, FileText } from 'lucide-react'

const stories = [
  {
    category: 'BLOG · 6 MIN',
    title: 'My $0 to $10k newsletter playbook',
    date: 'May 22',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=840&q=85',
  },
  {
    category: 'VIDEO · 12 MIN',
    title: 'I redesigned my link page live',
    date: 'May 18',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=840&q=85',
  },
]

function CreatorStories() {
  return (
    <section className="creator-section creator-stories-section" id="latest-drops" aria-labelledby="latest-drops-title">
      <div className="creator-section-heading creator-stories-heading">
        <div><span className="creator-eyebrow">THE CREATOR PLAYBOOK</span><h2 id="latest-drops-title">Ideas worth opening</h2></div>
        <a href="#latest-drops">View all <ArrowUpRight size={14} /></a>
      </div>
      <div className="creator-story-grid">
        {stories.map((story) => (
          <article className="creator-story-card" key={story.title}>
            <a href="/maya-chen" className="creator-story-image" style={{ backgroundImage: `url("${story.image}")` }} aria-label={`Read ${story.title}`}>
              <span><Eye size={14} /> 5.2k</span>
            </a>
            <div className="creator-story-copy">
              <span>{story.category} <time>{story.date}</time></span>
              <h3><a href="/maya-chen">{story.title}</a></h3>
              <p>Practical notes from building a creative business, shared with the community.</p>
              <a className="creator-story-read" href="/maya-chen"><FileText size={13} /> Read the story <Clock3 size={13} /> 6 min</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CreatorStories
