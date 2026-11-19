"use client";

import { useEffect, useState } from 'react'
import { ArrowUpRight, Clock3, Eye, FileText } from 'lucide-react'
import { apiRequest } from '../services/api'

type BlogPost = { _id: string; title: string; slug: string; category: string; excerpt: string; coverImage: string }

function CreatorStories() {
  const [stories, setStories] = useState<BlogPost[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<{ posts: BlogPost[] }>('/site/blog?limit=3')
      .then(({ posts }) => setStories(posts))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load CreatorHub stories.'))
  }, [])

  return (
    <section className="creator-section creator-stories-section" id="latest-drops" aria-labelledby="latest-drops-title">
      <div className="creator-section-heading creator-stories-heading">
        <div><span className="creator-eyebrow">FROM THE CREATORHUB TEAM</span><h2 id="latest-drops-title">Ideas worth opening</h2></div>
        <a href="/blog">View all <ArrowUpRight size={14} /></a>
      </div>
      <div className="creator-story-grid">
        {stories.map((story) => (
          <article className="creator-story-card" key={story.slug}>
            <a href={`/blog/${story.slug}`} className="creator-story-image" style={story.coverImage ? { backgroundImage: `url("${story.coverImage}")` } : undefined} aria-label={`Read ${story.title}`}>
              <span><Eye size={14} /> {story.category}</span>
            </a>
            <div className="creator-story-copy">
              <span>{story.category}</span>
              <h3><a href={`/blog/${story.slug}`}>{story.title}</a></h3>
              <p>{story.excerpt}</p>
              <a className="creator-story-read" href={`/blog/${story.slug}`}><FileText size={13} /> Read the story <Clock3 size={13} /></a>
            </div>
          </article>
        ))}
        {!stories.length && <div className="creator-info-empty"><FileText size={22} /><h3>{error ? 'Stories are temporarily unavailable' : 'New stories are on the way'}</h3><p>{error || 'Check the blog for the latest posts from the CreatorHub team.'}</p><a className="creator-story-read" href="/blog">Visit the blog <ArrowUpRight size={14} /></a></div>}
      </div>
    </section>
  )
}

export default CreatorStories
