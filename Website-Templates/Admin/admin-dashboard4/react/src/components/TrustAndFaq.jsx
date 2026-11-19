import { useState } from 'react'
import { Star, ShieldCheck, Headphones, Eye, Plus, Minus, ArrowUpRight } from 'lucide-react'


export default function TrustAndFaq({ onNavigate }) {
  const [openFaq, setOpenFaq] = useState(0)

  const reviews = [
    {
      stars: 5,
      text: '"My iTunes card was verified and paid out before I could even make coffee. Cardzip just gets it."',
      initials: 'TA',
      name: 'Tobi A.',
      role: 'Gift card trader · Lagos'
    },
    {
      stars: 5,
      text: '"I rented a number for verification without sharing my personal number."',
      initials: 'AO',
      name: 'Amara O.',
      role: 'Cardzip customer · Abuja'
    },
    {
      stars: 5,
      text: '"Bills, shopping and trading in one wallet? This is the one app I keep coming back to."',
      initials: 'DK',
      name: 'Damilola K.',
      role: 'Everyday customer · Ibadan'
    }
  ]

  const trustPillars = [
    {
      icon: <ShieldCheck size={20} className="trust-icon" />,
      title: 'Protected payments',
      desc: 'Encrypted from start to finish. Your money and data stay yours.'
    },
    {
      icon: <Headphones size={20} className="trust-icon" />,
      title: 'Humans, here to help',
      desc: 'Real support, around the clock. We\'re one message away.'
    },
    {
      icon: <Eye size={20} className="trust-icon" />,
      title: 'No hidden surprises',
      desc: 'Transparent rates and fees. See what you get before you commit.'
    }
  ]

  const faqs = [
    {
      question: 'How fast will I receive my gift card payout?',
      answer: 'Once your card is verified, your naira payout lands in your Cardzip wallet in under 60 seconds. You can withdraw to your bank whenever you\'re ready.'
    },
    {
      question: 'Which gift cards can I trade?',
      answer: 'We support 30+ major gift card brands including iTunes, Steam, Amazon, Google Play, Sephora, Nordstrom, and many more.'
    },
    {
      question: 'What are virtual numbers used for?',
      answer: 'Virtual number rentals can receive verification messages for supported services. Availability depends on the selected country and service.'
    },
    {
      question: 'Can I pay for orders with my Cardzip wallet?',
      answer: 'Yes! You can use your wallet balance to pay utility bills or purchase store items.'
    }
  ]

  return (
    <>
      {/* 1. REVIEWS SECTION */}
      <section className="reviews-band">
        <div className="trust-faq-content section-block">
          <div className="reviews-header">
            <h2 className="section-title">Good value. Great company.</h2>
            <div className="review-score">
              <Star size={13} fill="#0b1120" color="#0b1120" />
              <span>4.9 from 2,400+ happy reviews</span>
            </div>
          </div>

          <div className="reviews-grid">
            {reviews.map((rev, idx) => (
              <div key={idx} className="review-card">
                <div className="star-row">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} size={13} fill="#10b981" color="#10b981" />
                  ))}
                </div>
                <p className="review-text">{rev.text}</p>
                <div className="review-author">
                  <div className="avatar">{rev.initials}</div>
                  <div className="author-details">
                    <span className="author-name">{rev.name}</span>
                    <span className="author-role">{rev.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRUST PILLARS BAR */}
      <section className="trust-pillars-band">
        <div className="trust-pillars-banner">
          <div className="trust-header-col">
            <span className="badge-uppercase">BUILT ON TRUST</span>
            <h3 className="trust-headline">Your peace of mind, our priority.</h3>
          </div>

          <div className="pillars-grid">
            {trustPillars.map((p, idx) => (
              <div key={idx} className="pillar-item">
                {p.icon}
                <h4 className="pillar-title">{p.title}</h4>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FAQ ACCORDION */}
      <section className="faq-band">
        <div className="trust-faq-content faq-section">
          <div className="faq-left-col">
            <span className="badge-uppercase">A LITTLE MORE CLARITY</span>
            <h2 className="section-title">Questions?<br />We’ve got you.</h2>
            <p className="faq-subtext">Everything you need to get started. And a real person if you need more.</p>
            <button type="button" className="btn-help-center" onClick={() => onNavigate?.('/support')}>
              <span>Visit the help center</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="faq-accordion-col">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button className="faq-question-btn" onClick={() => setOpenFaq(isOpen ? null : idx)}>
                    <span>{faq.question}</span>
                    {isOpen ? <Minus size={16} className="accordion-icon" /> : <Plus size={16} className="accordion-icon" />}
                  </button>
                  {isOpen && <p className="faq-answer">{faq.answer}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}