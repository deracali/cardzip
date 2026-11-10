import { useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Star } from 'lucide-react'

const reviews = [
  { name: 'Maya K.', location: 'Brooklyn, NY', text: 'I got my Saturday back. The team was lovely, the place looked amazing, and booking took less time than making coffee.', initials: 'MK' },
  { name: 'Jordan P.', location: 'New York, NY', text: 'The price was clear from the start and the clean was even better than I expected. NOVA is now part of my routine.', initials: 'JP' },
  { name: 'Alex R.', location: 'Queens, NY', text: 'Finally, a service that makes a busy week feel manageable. The little details really made the difference.', initials: 'AR' },
]

function CustomerReviews() {
  const [activeReview, setActiveReview] = useState(0)
  const review = reviews[activeReview]
  const showReview = (direction) => setActiveReview((index) => (index + direction + reviews.length) % reviews.length)

  return (
    <section className="home-section reviews-section" id="reviews" aria-labelledby="reviews-title">
      <div className="reviews-summary">
        <span className="section-kicker">KIND WORDS, REAL HOMES</span>
        <h2 id="reviews-title">A fresh start,<br />by word of mouth.</h2>
        <div className="review-rating"><strong>4.9</strong><span>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill="currentColor" />)}</span></div>
        <p>From more than 2,400 neighbor-approved cleans.</p>
      </div>

      <article className="review-card" aria-live="polite">
        <span className="review-quote-mark">“</span>
        <div className="review-stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote>{review.text}</blockquote>
        <footer>
          <span className="review-avatar">{review.initials}</span>
          <span className="review-author"><strong>{review.name}</strong><small>{review.location} · Verified customer</small></span>
          <BadgeCheck className="review-verified" size={18} />
        </footer>
        <div className="review-controls">
          <div className="review-dots" aria-label={`Review ${activeReview + 1} of ${reviews.length}`}>
            {reviews.map((item, index) => <button key={item.initials} type="button" className={index === activeReview ? 'is-active' : ''} aria-label={`Show review ${index + 1}`} onClick={() => setActiveReview(index)} />)}
          </div>
          <div>
            <button type="button" aria-label="Previous review" onClick={() => showReview(-1)}><ArrowLeft size={15} /></button>
            <button type="button" aria-label="Next review" onClick={() => showReview(1)}><ArrowRight size={15} /></button>
          </div>
        </div>
      </article>
    </section>
  )
}

export default CustomerReviews
