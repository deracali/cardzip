"use client";

import type { ReactNode } from "react";
import { useCurrentPath } from "./hooks/useCurrentPath";
import { Header, NotFoundPage } from "./components/Shared";
import HomePage from './pages/home-page';
import FeaturesPage from './pages/features-page';
import IntegrationsPage from './pages/integrations-page';
import PricingPage from './pages/pricing-page';
import FAQPage from './pages/faq-page';
import DocsPage from './pages/docs-page';
import DemoPage from './pages/demo-page';
import FormPage from './pages/form-page';
import CheckoutPage from './pages/checkout-page';
import LegalPage from './pages/legal-page';

export default function App() {
  const path = useCurrentPath();
  const pages: Record<string, ReactNode> = {
    "/": <HomePage />,
    "/features": <FeaturesPage />,
    "/integrations": <IntegrationsPage />,
    "/pricing": <PricingPage />,
    "/faq": <FAQPage />,
    "/docs": <DocsPage />,
    "/demo": <DemoPage />,
    "/signup": <FormPage mode="signup" />,
    "/login": <FormPage mode="login" />,
    "/contact": <FormPage mode="contact" />,
    "/checkout": <CheckoutPage />,
    "/privacy": <LegalPage type="privacy" />,
    "/terms": <LegalPage type="terms" />,
  };

  return <div className="app-shell"><Header />{pages[path] ?? <NotFoundPage />}</div>;
}