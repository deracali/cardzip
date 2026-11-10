import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Code2,
  GraduationCap,
  Menu,
  Palette,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { learningCourses as courses } from '../data/learningData'
import './LearningPages.css'

const studentsImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=84'
const courseCategories = [...new Set(courses.map((course) => course.category))]

const categories = [
  { title: 'Web Development', courses: '240 courses', learners: '180k learners', icon: Code2, style: 'lavender' },
  { title: 'AI & Data Science', courses: '185 courses', learners: '142k learners', icon: Sparkles, style: 'mint' },
  { title: 'UI/UX Design', courses: '132 courses', learners: '98k learners', icon: Palette, style: 'rose' },
  { title: 'Business', courses: '210 courses', learners: '120k learners', icon: BriefcaseBusiness, style: 'yellow' },
  { title: 'Marketing', courses: '156 courses', learners: '87k learners', icon: GraduationCap, style: 'blue' },
]

const filters = ['All', 'Design', 'Code', 'Business']

function Brand({ light = false }) {
  return (
    <a className={`learning-brand${light ? ' learning-brand-light' : ''}`} href="/" aria-label="Skillora home">
      <span className="brand-icon">S</span>
      <span>Skillora</span>
    </a>
  )
}

export function LearningHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="learning-header">
      <div className="learning-header-inner">
        <Brand />
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`main-navigation${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a href="/courses" onClick={() => setMenuOpen(false)}>Explore Courses</a>
          <a href="/categories" onClick={() => setMenuOpen(false)}>Categories</a>
          <a href="/instructors" onClick={() => setMenuOpen(false)}>Instructors</a>
          <a href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        </nav>
        <div className="header-actions">
          <a className="header-login" href="/login">Log in</a>
          <a className="button button-primary header-cta" href="/signup">Get Started</a>
        </div>
      </div>
    </header>
  )
}

export function LearningFooter() {
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(event) {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer className="learning-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Brand light />
          <p>Master new skills with expert-led video courses, lifetime access and certificates.</p>
          <div className="social-links" aria-label="Social links">
            <a href="#social" aria-label="X">x</a>
            <a href="#social" aria-label="LinkedIn">in</a>
            <a href="#social" aria-label="YouTube">▶</a>
            <a href="#social" aria-label="Instagram">◎</a>
          </div>
        </div>
        <div className="footer-link-column">
          <h2>Company</h2>
          <a href="#about">About us</a>
          <a href="#careers">Careers</a>
          <a href="#press">Press</a>
          <a href="#blog">Blog</a>
        </div>
        <div className="footer-link-column">
          <h2>Courses</h2>
          <a href="/courses">Web Development</a>
          <a href="/courses">Data Science</a>
          <a href="/courses">Design</a>
          <a href="/courses">Marketing</a>
        </div>
        <div className="footer-link-column">
          <h2>Support</h2>
          <a href="#help">Help Center</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
        </div>
        <form className="newsletter-card" onSubmit={handleSubscribe}>
          <label htmlFor="newsletter-email">Get course updates</label>
          <input id="newsletter-email" type="email" placeholder="Email address" required />
          <button type="submit">{subscribed ? <><Check size={15} /> Subscribed</> : 'Subscribe'}</button>
          {subscribed && <span className="subscribe-confirmation" role="status">Thanks for subscribing!</span>}
        </form>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Skillora Inc. All rights reserved.</span>
        <span>Made for lifelong learners</span>
      </div>
    </footer>
  )
}

export function CourseCard({ course, isFavorite, onToggleFavorite }) {
  return (
    <article className="course-card">
      <div className="course-image-wrap">
        <img src={course.image} alt="" className="course-image" />
        <span className={`course-category-tag tag-${course.tint}`}>{course.category}</span>
        <span className="course-duration">{course.duration}</span>
        <button
          className={`favorite-button${isFavorite ? ' is-favorite' : ''}`}
          type="button"
          onClick={() => onToggleFavorite(course.id)}
          aria-label={isFavorite ? `Remove ${course.title} from saved courses` : `Save ${course.title}`}
          aria-pressed={isFavorite}
        >
          <Bookmark size={15} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="course-card-content">
        <h3>{course.title}</h3>
        <p className="course-instructor">{course.instructor}</p>
        <p className="course-rating"><Star size={13} fill="currentColor" /> {course.rating} <span>({course.students} students)</span></p>
        <div className="course-card-bottom">
          <p className="course-price"><strong>${course.price}</strong> <del>${course.oldPrice}</del></p>
          <a className="button button-primary enroll-button" href={`/checkout?course=${course.id}`}>Enroll Now</a>
        </div>
      </div>
    </article>
  )
}

function LearningLandingPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchText, setSearchText] = useState('')
  const [searchCategory, setSearchCategory] = useState('All')
  const [favorites, setFavorites] = useState([])

  const visibleCourses = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    return courses.filter((course) => {
      const filterMatches = activeFilter === 'All'
        || course.category.toLowerCase().includes(activeFilter.toLowerCase())
        || (activeFilter === 'Code' && course.id === 'web-development')
      const queryMatches = !query || `${course.title} ${course.category} ${course.instructor}`.toLowerCase().includes(query)
      const categoryMatches = searchCategory === 'All' || course.category === searchCategory
      return filterMatches && queryMatches && categoryMatches
    })
  }, [activeFilter, searchCategory, searchText])

  function handleSearch(event) {
    event.preventDefault()
    setActiveFilter('All')
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
  }

  function toggleFavorite(courseId) {
    setFavorites((current) => current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId])
  }

  return (
    <div className="learning-site">
      <LearningHeader />
      <main>
        <section className="learning-hero">
          <div className="hero-content">
            <span className="launch-pill"><span>NEW</span> AI &amp; Data Science tracks just launched</span>
            <h1>Master New Skills with <span>Expert-Led Video Courses</span></h1>
            <p className="hero-description">Lifetime access, hands-on projects and shareable certificates. Learn from 900+ industry experts at your own pace.</p>
            <form className="course-search" onSubmit={handleSearch}>
              <label className="search-input-wrap" htmlFor="course-search-input">
                <Search size={16} aria-hidden="true" />
                <input
                  id="course-search-input"
                  type="search"
                  placeholder="What do you want to learn today?"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>
              <label className="search-category-wrap" htmlFor="course-category-select">
                <select id="course-category-select" value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)}>
                  <option value="All">Category</option>
                  {courseCategories.map((category) => <option value={category} key={category}>{category}</option>)}
                </select>
              </label>
              <button className="button button-primary search-submit" type="submit">Search</button>
            </form>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>AM</span><span>JC</span><span>SR</span><span>MK</span>
              </div>
              <p><strong><Star size={13} fill="currentColor" /> 4.8/5</strong><span>Loved by 2.4M learners worldwide</span></p>
              <div className="proof-divider" />
              <p><strong>35k+</strong><span>Courses</span></p>
              <p><strong>900+</strong><span>Experts</span></p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-frame">
              <img src={studentsImage} alt="Students learning together around a laptop" />
            </div>
            <div className="floating-proof certificate-proof"><span><Check size={16} /></span><div><strong>Certificate earned</strong><small>UI/UX Design Pro</small></div></div>
            <div className="floating-proof live-proof"><span className="live-avatar">S</span><div><strong>Live class · 2.1k watching</strong><small>● Python for beginners</small></div></div>
          </div>
        </section>

        <div className="trusted-strip">
          <div className="trusted-inner">
            <span>Trusted by teams at</span>
            <strong>Google</strong><strong>Spotify</strong><strong>Airbnb</strong><strong>Shopify</strong><strong>Notion</strong>
          </div>
        </div>

        <section className="content-section category-section" id="categories">
          <div className="section-heading">
            <div><span className="section-kicker">Top categories</span><h2>Explore by field</h2></div>
            <a className="subtle-link" href="/categories">View all categories <ArrowRight size={14} /></a>
          </div>
          <div className="category-grid">
            {categories.map(({ title, courses: courseCount, learners, icon: Icon, style }) => (
              <a className="category-card" href={`/categories/${title.toLowerCase().replaceAll('&', 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} key={title}>
                <span className={`category-icon icon-${style}`}><Icon size={17} /></span>
                <span className="category-copy"><strong>{title}</strong><small>{courseCount} <i>·</i> {learners}</small></span>
                <ChevronRight className="category-arrow" size={16} />
              </a>
            ))}
            <a className="category-card all-categories-card" href="/categories">
              <span className="all-category-plus">+</span>
              <span className="category-copy"><strong>View all 24 fields</strong><small>Find your next obsession</small></span>
              <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <section className="content-section featured-section" id="courses">
          <div className="section-heading">
            <div><span className="section-kicker">Hand-picked for you</span><h2>Featured courses</h2></div>
            <div className="course-filters" role="group" aria-label="Filter featured courses">
              {filters.map((filter) => (
                <button
                  className={activeFilter === filter ? 'filter-chip is-active' : 'filter-chip'}
                  type="button"
                  key={filter}
                  aria-pressed={activeFilter === filter}
                  onClick={() => { setActiveFilter(filter); setSearchCategory('All') }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="course-grid">
            {visibleCourses.length > 0
              ? visibleCourses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} isFavorite={favorites.includes(course.id)} onToggleFavorite={toggleFavorite} />)
              : <p className="empty-courses">No courses match that search. Try another topic or category.</p>}
          </div>
        </section>

        <section className="membership-banner" id="pricing">
          <div className="membership-copy">
            <span className="membership-eyebrow"><Sparkles size={14} /> Skillora Plus</span>
            <h2>Get unlimited access to 35,000+ courses</h2>
            <p>One subscription. Lifetime skills. Cancel anytime. Starting at $15/mo.</p>
            <div className="membership-actions">
              <a className="button button-white" href="/pricing">View pricing</a>
              <a className="button button-mint" href="/checkout?plan=plus-monthly">Start 7-day free trial</a>
            </div>
          </div>
          <div className="membership-photo">
            <img src={studentsImage} alt="A learner enjoying an online course" />
            <span className="membership-shape" />
          </div>
        </section>
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningLandingPage
