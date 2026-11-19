import { ArrowUpRight, Clock3, Eye, FileText } from 'lucide-react'
import { resourceArticles } from '../pages/creatorPageContent'

const images = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=840&q=85',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=840&q=85',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=840&q=85',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=840&q=85',
]

function CreatorStories() {
  return (
    <section className="creator-section creator-stories-section" id="latest-drops" aria-labelledby="latest-drops-title">
      <div className="creator-section-heading creator-stories-heading">
        <div><span className="creator-eyebrow">THE CREATOR PLAYBOOK</span><h2 id="latest-drops-title">Ideas worth opening</h2></div>
        <a href="/resources">View all <ArrowUpRight size={14} /></a>
      </div>
      <div className="creator-story-grid">
        {resourceArticles.map((story, index) => (
          <article className="creator-story-card" key={story.slug}>
            <a href={`/resources/${story.slug}`} className="creator-story-image" style={{ backgroundImage: `url("${images[index]}")` }} aria-label={`Read ${story.title}`}>
              <span><Eye size={14} /> FIELD NOTES</span>
            </a>
            <div className="creator-story-copy">
              <span>{story.category} <time>{story.readTime}</time></span>
              <h3><a href={`/resources/${story.slug}`}>{story.title}</a></h3>
              <p>{story.summary}</p>
              <a className="creator-story-read" href={`/resources/${story.slug}`}><FileText size={13} /> Read the guide <Clock3 size={13} /> {story.readTime}</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CreatorStories
