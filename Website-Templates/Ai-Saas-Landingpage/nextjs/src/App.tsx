"use client";

import type { ReactNode } from "react";
import { useCurrentPath } from "./hooks/useCurrentPath";
import { Header, NotFoundPage } from "./components/Shared";
import HomePage from './pages/home-page';
import FeaturesPage from './pages/features-page';
import IntegrationsPage from './pages/integrations-page';
import PricingPage from './pages/pricing-page';
import FAQPage from './pages/faq-page';
import DocsPage, { DocumentDetailPage } from './pages/docs-page';
import DemoPage from './pages/demo-page';
import FormPage from './pages/form-page';
import CheckoutPage from './pages/checkout-page';
import LegalPage from './pages/legal-page';
import ClientDashboardPage from './pages/client-dashboard-page';
import DynamicContentPage from './components/DynamicContentPage';
import { useEffect, useState } from 'react';
import { NexaraApiError, nexaraApi, type NexaraPage } from './services/nexara-api';

export default function App() {
  const path = useCurrentPath();
  const [dynamicPage, setDynamicPage] = useState<NexaraPage | null>(null);
  const [dynamicError, setDynamicError] = useState('');
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
    "/trial": <FormPage mode="trial" />,
    "/checkout": <CheckoutPage />,
    "/dashboard": <ClientDashboardPage />,
    "/privacy": <LegalPage type="privacy" />,
    "/terms": <LegalPage type="terms" />,
  };

  useEffect(() => {
    let active = true;
    setDynamicPage(null);
    setDynamicError('');
    if (['/dashboard', '/login', '/signup', '/contact', '/trial', '/checkout'].includes(path) || path.startsWith('/docs/')) {
      return () => { active = false; };
    }

    nexaraApi.publicPage(path)
      .then(({ data }) => { if (active) setDynamicPage(data); })
      .catch((requestError: unknown) => {
        if (!active || (requestError instanceof NexaraApiError && requestError.status === 404)) return;
        if (active) setDynamicError(requestError instanceof Error ? requestError.message : 'Dynamic website content could not be loaded.');
      });

    return () => { active = false; };
  }, [path]);

  const page = path.startsWith('/docs/') ? <DocumentDetailPage slug={decodeURIComponent(path.slice('/docs/'.length))} /> : pages[path] ?? <NotFoundPage />;
  return <div className="app-shell"><Header />{dynamicError && <p className="cms-api-warning" role="status">{dynamicError}</p>}{dynamicPage ? <DynamicContentPage page={dynamicPage} /> : page}</div>;
}