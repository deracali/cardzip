"use client";

import { useEffect } from "react";
import { useCurrentPath } from "./hooks/useCurrentPath";
import NotFound from "./pages/not-found-page";
import HomePage from './pages/home-page';
import WorkPage from './pages/work-page';
import ServicesPage from './pages/services-page';
import CaseStudiesPage from './pages/case-studies-page';
import AboutPage from './pages/about-page';
import QuotePage from './pages/quote-page';
import CaseStudyPage from './pages/case-study-page';
import AuthPage from './pages/auth-page';
import DashboardPage from './pages/dashboard-page';
import { pageTitles } from "./components/Shared";

export default function App() {
  const path = useCurrentPath();
  const isSignup = path === "/signup";
  const isLogin = path === "/login";
  const isDashboard = path === "/dashboard";
  const isHome = path === "/";
  const projectMatch = path.match(/^\/case-studies\/([^/]+)$/);
  const projectSlug = projectMatch ? decodeURIComponent(projectMatch[1]) : "";

  useEffect(() => {
    document.title = isHome
      ? "NOVA Studio | Creative Agency for Ambitious Brands"
      : isDashboard
        ? "Client Dashboard | NOVA Studio"
        : isSignup
          ? "Create Your Account | NOVA Studio"
          : isLogin
            ? "Client Portal Login | NOVA Studio"
            : pageTitles[path] || (projectSlug ? "Case Study | NOVA Studio" : "NOVA Studio | Creative Agency");
  }, [isDashboard, isHome, isLogin, isSignup, path, projectSlug]);

  if (isHome) return <HomePage />;
  if (path === "/work") return <WorkPage />;
  if (path === "/services") return <ServicesPage />;
  if (path === "/case-studies") return <CaseStudiesPage />;
  if (projectSlug) return <CaseStudyPage slug={projectSlug} />;
  if (path === "/about") return <AboutPage />;
  if (path === "/quote") return <QuotePage />;
  if (isLogin) return <AuthPage />;
  if (isSignup) return <AuthPage signup />;
  if (isDashboard) return <DashboardPage />;
  return <NotFound />;
}