"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useCurrentPath } from "./hooks/useCurrentPath";

const pageTitles: Record<string, string> = {
  "/work": "Selected Work | NOVA Studio",
  "/services": "Creative Services | NOVA Studio",
  "/case-studies": "Case Studies | NOVA Studio",
  "/about": "About the Creators | NOVA Studio",
  "/quote": "Start a Project | NOVA Studio",
  "/contact": "Client Messages | NOVA Studio",
  "/messages": "Client Messages | NOVA Studio",
};

function PageLoading() {
  return <main className="page-loading" role="status">Loading page…</main>;
}

const NotFound = dynamic(() => import("./views/not-found-page"), { loading: PageLoading });
const HomePage = dynamic(() => import("./views/home-page"), { loading: PageLoading });
const WorkPage = dynamic(() => import("./views/work-page"), { loading: PageLoading });
const ServicesPage = dynamic(() => import("./views/services-page"), { loading: PageLoading });
const CaseStudiesPage = dynamic(() => import("./views/case-studies-page"), { loading: PageLoading });
const AboutPage = dynamic(() => import("./views/about-page"), { loading: PageLoading });
const QuotePage = dynamic(() => import("./views/quote-page"), { loading: PageLoading });
const ContactPage = dynamic(() => import("./views/contact-page"), { loading: PageLoading });
const CaseStudyPage = dynamic(() => import("./views/case-study-page"), { loading: PageLoading });
const AuthPage = dynamic(() => import("./views/auth-page"), { loading: PageLoading });
const DashboardPage = dynamic(() => import("./views/dashboard-page"), { loading: PageLoading });

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
  if (path === "/contact") return <ContactPage />;
  if (path === "/messages") return <ContactPage />;
  if (isLogin) return <AuthPage />;
  if (isSignup) return <AuthPage signup />;
  if (isDashboard) return <DashboardPage />;
  return <NotFound />;
}