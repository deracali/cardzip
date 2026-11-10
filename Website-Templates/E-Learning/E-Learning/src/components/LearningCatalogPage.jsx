import { useMemo, useState } from 'react'
import { ArrowRight, Search, Star } from 'lucide-react'
import { learningCourses } from '../data/learningData'
import { CourseCard, LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

const categories = ['All fields', ...new Set(learningCourses.map((course) => course.category))]

function LearningCatalogPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All fields')
  const [sortBy, setSortBy] = useState('popular')
  const [favorites, setFavorites] = useState([])

  const visibleCourses = useMemo(() => {
    const search = query.trim().toLowerCase()
    const results = learningCourses.filter((course) => {
      const matchesCategory = category === 'All fields' || course.category === category
      const matchesQuery = !search || `${course.title} ${course.category} ${course.instructor}`.toLowerCase().includes(search)
      return matchesCategory && matchesQuery
    })

    return [...results].sort((first, second) => {
      if (sortBy === 'price-low') return first.price - second.price
      if (sortBy === 'price-high') return second.price - first.price
      return Number(second.rating) - Number(first.rating)
    })
  }, [category, query, sortBy])

  function toggleFavorite(courseId) {
    setFavorites((current) => current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId])
  }

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page catalog-page">
        <section className="extra-page-intro">
          <span className="section-kicker">Explore Skillora</span>
          <h1>Find a course that moves you forward.</h1>
          <p>Learn at your own pace with practical lessons taught by people who do the work.</p>
        </section>
        <div className="catalog-controls">
          <label className="catalog-search">
            <Search size={17} />
            <input aria-label="Search courses" type="search" placeholder="Search courses or instructors" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="catalog-sort">
            <span>Sort by</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="popular">Top rated</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>
        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <h2>Categories</h2>
            {categories.map((item) => (
              <button className={category === item ? 'catalog-category is-active' : 'catalog-category'} type="button" key={item} onClick={() => setCategory(item)}>
                <span>{item}</span>
                <span>{item === 'All fields' ? learningCourses.length : learningCourses.filter((course) => course.category === item).length}</span>
              </button>
            ))}
            <div className="catalog-promo"><strong>Learn something new.</strong><p>Start with a free lesson and build a habit that lasts.</p><a href="/pricing">See plans <ArrowRight size={13} /></a></div>
          </aside>
          <section className="catalog-results" aria-label="Course results">
            <div className="catalog-results-heading">
              <h2>{category === 'All fields' ? 'All courses' : category}</h2>
              <span>{visibleCourses.length} {visibleCourses.length === 1 ? 'course' : 'courses'}</span>
            </div>
            {visibleCourses.length ? (
              <div className="course-grid catalog-course-grid">
                {visibleCourses.map((course) => <CourseCard key={course.id} course={course} isFavorite={favorites.includes(course.id)} onToggleFavorite={toggleFavorite} />)}
              </div>
            ) : (
              <div className="catalog-empty"><Search size={21} /><strong>No courses found</strong><span>Try a different search or category.</span></div>
            )}
            <div className="catalog-rating-note"><Star size={14} fill="currentColor" /> Every course is reviewed by learners and taught by a verified instructor.</div>
          </section>
        </div>
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningCatalogPage
