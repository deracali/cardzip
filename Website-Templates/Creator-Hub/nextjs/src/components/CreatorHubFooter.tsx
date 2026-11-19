import { ArrowRight, BookOpen, CircleHelp } from 'lucide-react'

function CreatorHubFooter() {
  return (
    <>
      <section className="creator-final-cta">
        <div className="creator-final-cta-inner">
          <div><span className="creator-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Bring your work together in one clear place.</h2><p>Start with a profile, then add links, content and products as you need them.</p></div>
          <div className="creator-final-stats"><strong>Profile<small>Introduce your work</small></strong><strong>Audience<small>Invite people to follow</small></strong><strong>Storefront<small>Offer digital products</small></strong></div>
          <a className="creator-button creator-button-primary" href="/signup">Create my hub <ArrowRight size={15} /></a>
        </div>
      </section>
      <footer className="creator-footer">
        <div className="creator-footer-inner">
          <a className="creator-brand" href="/" aria-label="CreatorHub home"><img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span></a>
          <nav aria-label="Footer navigation"><a href="/features">Features</a><a href="/creators">Creators</a><a href="/explore">Explore</a><a href="/store">Store</a><a href="/blog">Blog</a><a href="/resources">Resources</a><a href="/about">About</a><a href="/help">Help</a><a href="/#pricing">Pricing</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/login">Sign in</a></nav>
          <div className="creator-footer-social"><a href="/resources" aria-label="Creator resources"><BookOpen size={15} /></a><a href="/help" aria-label="Help center"><CircleHelp size={15} /></a></div>
        </div>
        <p className="creator-copyright">© {new Date().getFullYear()} CreatorHub. Built for people who make things.</p>
      </footer>
    </>
  )
}

export default CreatorHubFooter
