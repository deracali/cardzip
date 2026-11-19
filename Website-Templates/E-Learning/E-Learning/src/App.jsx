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
import SkilloraAdmin from './admin/SkilloraAdmin'
import { InstructorDashboard, LearningDashboard } from './admin/SkilloraPortals'
import './App.css'

function App({ mode = 'local', apiBaseUrl = '' }) {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  const [, page, itemId] = pathname.split('/')

  if (pathname === '/admin' || pathname === '/admin/login') return <SkilloraAdmin mode={mode} apiBaseUrl={apiBaseUrl} />
  if (pathname === '/instructor/dashboard' && mode === 'api') return <InstructorDashboard apiBaseUrl={apiBaseUrl} />
  if (pathname === '/dashboard') return <LearningDashboard mode={mode} apiBaseUrl={apiBaseUrl} />
  if (pathname === '/login' || pathname === '/signup') return <LearningAuthPage mode={pathname === '/signup' ? 'signup' : 'login'} storageMode={mode} apiBaseUrl={apiBaseUrl} />

  if (pathname === '/courses') return <LearningCatalogPage mode={mode} apiBaseUrl={apiBaseUrl} />
  if (pathname === '/categories') return <LearningCategoriesPage />
  if (pathname === '/pricing') return <LearningPricingPage />
  if (pathname === '/checkout') return <LearningCheckoutPage mode={mode} apiBaseUrl={apiBaseUrl} />
  if (page === 'learn' && itemId) return <LearningLessonPage courseId={itemId} mode={mode} apiBaseUrl={apiBaseUrl} />
  if (page === 'quiz' && itemId) return <LearningQuizPage courseId={itemId} />
  if (page === 'categories' && itemId) return <LearningCategoriesPage categorySlug={itemId} />
  if (pathname === '/instructors') return <InstructorDirectoryPage />
  if (page === 'instructors' && itemId) return <InstructorProfilePage instructorId={itemId} />

  return <LearningLandingPage mode={mode} apiBaseUrl={apiBaseUrl} />
}

export default App
