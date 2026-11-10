import { BadgeCheck, Star } from 'lucide-react'
import { customerReviews } from '../../data/homeServices'

function CustomerReviews() {
  return (
    <section className="ff-container ff-reviews-section" id="reviews" aria-labelledby="ff-reviews-title">
      <div className="ff-reviews-heading">
        <div className="ff-google-rating"><strong>G</strong><span aria-label="5 out of 5 stars"><Star /><Star /><Star /><Star /><Star /></span><b>4.9</b><small>800+ local homeowner reviews</small></div>
        <div>
          <h2 id="ff-reviews-title">Trusted on every block we serve</h2>
          <p>Licensed · Insured · Background-checked techs</p>
        </div>
        <span className="ff-license"><BadgeCheck size={14} /> License #HVAC-884201</span>
      </div>
      <div className="ff-review-grid">
        {customerReviews.map(({ quote, name, service, initials }) => (
          <blockquote className="ff-review-card" key={name}>
            <div className="ff-review-stars" aria-label="5 out of 5 stars"><Star /><Star /><Star /><Star /><Star /></div>
            <p>{quote}</p>
            <footer>
              <span className="ff-review-avatar" aria-hidden="true">{initials}</span>
              <span><strong>{name}</strong><small>{service}</small></span>
              <BadgeCheck className="ff-review-verified" size={15} aria-label="Verified customer" />
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

export default CustomerReviews
