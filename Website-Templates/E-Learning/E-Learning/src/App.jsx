import LearningAuthPage from './components/LearningAuthPage'
import LearningCatalogPage from './components/LearningCatalogPage'
import LearningCategoriesPage from './components/LearningCategoriesPage'
import LearningCheckoutPage from './components/LearningCheckoutPage'
import LearningDashboardPage from './components/LearningDashboardPage'
import { InstructorDirectoryPage, InstructorProfilePage } from './components/LearningInstructorsPage'
import LearningLessonPage from './components/LearningLessonPage'
import LearningLandingPage from './components/LearningLandingPage'
import LearningPricingPage from './components/LearningPricingPage'
import LearningQuizPage from './components/LearningQuizPage'
import './App.css'

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  const [, page, itemId] = pathname.split('/')

  if (pathname === '/login' || pathname === '/signup') {
    return <LearningAuthPage mode={pathname === '/signup' ? 'signup' : 'login'} />
  }

  if (pathname === '/courses') return <LearningCatalogPage />
  if (pathname === '/categories') return <LearningCategoriesPage />
  if (pathname === '/dashboard') return <LearningDashboardPage />
  if (pathname === '/pricing') return <LearningPricingPage />
  if (pathname === '/checkout') return <LearningCheckoutPage />
  if (page === 'learn' && itemId) return <LearningLessonPage courseId={itemId} />
  if (page === 'quiz' && itemId) return <LearningQuizPage courseId={itemId} />
  if (page === 'categories' && itemId) return <LearningCategoriesPage categorySlug={itemId} />
  if (pathname === '/instructors') return <InstructorDirectoryPage />
  if (page === 'instructors' && itemId) return <InstructorProfilePage instructorId={itemId} />

  return <LearningLandingPage />
}

export default App
