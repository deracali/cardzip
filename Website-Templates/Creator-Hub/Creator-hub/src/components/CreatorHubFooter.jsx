import { ArrowRight, Camera, Video } from 'lucide-react'

function CreatorHubFooter() {
  return (
    <>
      <section className="creator-final-cta">
        <div className="creator-final-cta-inner">
          <div><span className="creator-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Claim your link before someone else does.</h2><p>Free forever. Upgrade when you blow up.</p></div>
          <div className="creator-final-stats"><strong>120k+<small>Creators</small></strong><strong>$4.2M<small>Paid out</small></strong></div>
          <a className="creator-button creator-button-primary" href="/signup">Create my hub <ArrowRight size={15} /></a>
        </div>
      </section>
      <footer className="creator-footer">
        <div className="creator-footer-inner">
          <a className="creator-brand" href="/" aria-label="CreatorHub home"><img className="creator-brand-logo" src="/creatorhub-logo.svg" alt="" /><span>CreatorHub</span></a>
          <nav aria-label="Footer navigation"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#latest-drops">Blog</a><a href="/login">Sign in</a></nav>
          <div className="creator-footer-social"><a href="https://instagram.com" aria-label="Instagram"><Camera size={15} /></a><a href="https://youtube.com" aria-label="YouTube"><Video size={15} /></a></div>
        </div>
        <p className="creator-copyright">© {new Date().getFullYear()} CreatorHub. Built for people who make things.</p>
      </footer>
    </>
  )
}

export default CreatorHubFooter
