import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  GraduationCap,
  Palette,
  Sparkles,
} from 'lucide-react'
import { learningCourses } from '../data/learningData'
import { CourseCard, LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

const categoryDetails = {
  'web-development': {
    name: 'Web Development',
    description: 'Build practical coding skills, create responsive websites, and bring your ideas to life on the web.',
    icon: Code2,
    style: 'lavender',
  },
  'ai-and-data-science': {
    name: 'AI & Data Science',
    description: 'Explore data, learn machine learning fundamentals, and develop a thoughtful understanding of AI.',
    icon: Sparkles,
    style: 'mint',
  },
  'ui-ux-design': {
    name: 'UI/UX Design',
    description: 'Create user-friendly digital experiences with research, wireframing, prototyping, and visual design.',
    icon: Palette,
    style: 'rose',
  },
  business: {
    name: 'Business',
    description: 'Strengthen your leadership, product strategy, and practical business skills.',
    icon: BriefcaseBusiness,
    style: 'yellow',
  },
  marketing: {
    name: 'Marketing',
    description: 'Learn how to understand your audience, plan campaigns, and measure meaningful results.',
    icon: GraduationCap,
    style: 'blue',
  },
}

function CategoryCard({ category, courses }) {
  const Icon = category.icon

  return (
    <a className="learning-category-card" href={`/categories/${category.slug}`}>
      <img src={courses[0].image} alt="" />
      <div className="learning-category-card-copy">
        <span className={`category-icon icon-${category.style}`}><Icon size={18} /></span>
        <span className="section-kicker">{courses.length} {courses.length === 1 ? 'course' : 'courses'}</span>
        <h2>{category.name}</h2>
        <p>{category.description}</p>
        <span className="category-browse-link">Browse courses <ArrowRight size={14} /></span>
      </div>
    </a>
  )
}

function LearningCategoriesPage({ categorySlug }) {
  const [favorites, setFavorites] = useState([])
  const groupedCourses = Object.values(categoryDetails).map((category) => ({
    ...category,
    slug: Object.keys(categoryDetails).find((slug) => categoryDetails[slug] === category),
    courses: learningCourses.filter((course) => course.category === category.name),
  })).filter((category) => category.courses.length)

  function toggleFavorite(courseId) {
    setFavorites((current) => current.includes(courseId)
      ? current.filter((id) => id !== courseId)
      : [...current, courseId])
  }

  if (!categorySlug) {
    return (
      <div className="learning-site extra-site">
        <LearningHeader />
        <main className="extra-page categories-page">
          <section className="extra-page-intro">
            <span className="section-kicker">Explore Skillora</span>
            <h1>Find your next field of study.</h1>
            <p>Browse practical courses by subject and choose a skill you’re excited to build.</p>
          </section>
          <div className="learning-category-grid">
            {groupedCourses.map((category) => <CategoryCard category={category} courses={category.courses} key={category.slug} />)}
          </div>
        </main>
        <LearningFooter />
      </div>
    )
  }

  const category = categoryDetails[categorySlug]
  const categoryCourses = learningCourses.filter((course) => course.category === category?.name)

  if (!category || !categoryCourses.length) {
    return (
      <div className="learning-site extra-site">
        <LearningHeader />
        <main className="extra-page">
          <section className="category-not-found">
            <span className="section-kicker">Categories</span>
            <h1>We couldn’t find that category.</h1>
            <p>Browse all fields to find the courses you’re looking for.</p>
            <a className="button button-primary" href="/categories">View all categories <ArrowRight size={14} /></a>
          </section>
        </main>
        <LearningFooter />
      </div>
    )
  }

  const Icon = category.icon

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page category-detail-page">
        <a className="back-to-link" href="/categories"><ArrowLeft size={14} /> All categories</a>
        <section className="category-detail-hero">
          <span className={`category-icon icon-${category.style}`}><Icon size={21} /></span>
          <span className="section-kicker">{categoryCourses.length} {categoryCourses.length === 1 ? 'course' : 'courses'} to explore</span>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
          <a className="button button-primary" href="/courses">Explore the full catalog <ArrowRight size={14} /></a>
        </section>
        <section className="category-detail-courses">
          <div className="section-heading">
            <div><span className="section-kicker">Learn at your own pace</span><h2>{category.name} courses</h2></div>
            <span>{categoryCourses.length} available</span>
          </div>
          <div className="course-grid">
            {categoryCourses.map((course) => (
              <CourseCard key={course.id} course={course} isFavorite={favorites.includes(course.id)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningCategoriesPage
