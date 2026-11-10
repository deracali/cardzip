import { BadgeCheck, Star } from 'lucide-react'

const testimonials = [
  { quote: 'My color has never looked this luminous. The scalp massage alone is worth booking for.', name: 'Amara Chen', detail: 'Silk blowout · Soho', initial: 'A' },
  { quote: 'Skin was glass for weeks. The esthetician mapped my whole routine without upselling.', name: 'Sofia Marquez', detail: 'Glow facial · Williamsburg', initial: 'S' },
  { quote: 'They handled 8 of us flawlessly. Messages, calm energy, photos were unreal.', name: 'Priya Nair', detail: 'Bridal party · Soho', initial: 'P' },
]

function ReviewsSection() {
  return (
    <section className="salon-reviews" id="reviews" aria-labelledby="reviews-title">
      <div className="salon-review-summary">
        <span className="salon-stars" aria-label="Rated five out of five">★★★★★ <strong>4.9</strong></span>
        <h2 id="reviews-title">Loved by 12,400+ regulars</h2>
        <p><BadgeCheck size={13} /> Verified visits only · Google · Yelp · Fresha</p>
      </div>
      <div className="salon-review-grid">
        {testimonials.map((review) => (
          <blockquote className="salon-review-card" key={review.name}>
            <span className="salon-review-stars" aria-label="Five stars"><Star /><Star /><Star /><Star /><Star /></span>
            <p>“{review.quote}”</p>
            <footer><span className="salon-review-avatar">{review.initial}</span><span><strong>{review.name}</strong><small>{review.detail}</small></span><BadgeCheck className="salon-verified-icon" size={14} /></footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

export default ReviewsSection
