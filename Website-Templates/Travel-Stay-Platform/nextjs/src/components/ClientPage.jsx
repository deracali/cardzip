"use client";

import dynamic from "next/dynamic";
import { stays } from "../data/stays";

const screens = {
  home: dynamic(() => import("../screens/HomePage"), { ssr: false }),
  stays: dynamic(() => import("../screens/StayListPage"), { ssr: false }),
  stayDetail: dynamic(() => import("../screens/StayDetailPage"), { ssr: false }),
  booking: dynamic(() => import("../screens/BookingPage"), { ssr: false }),
  checkout: dynamic(() => import("../screens/CheckoutPage"), { ssr: false }),
  paymentCallback: dynamic(() => import("../screens/PaymentCallbackPage"), { ssr: false }),
  auth: dynamic(() => import("../screens/AuthPage"), { ssr: false }),
  clientDashboard: dynamic(() => import("../screens/ClientDashboardPage"), { ssr: false }),
  adminAuth: dynamic(() => import("../screens/AdminAuthPage"), { ssr: false }),
  adminDashboard: dynamic(() => import("../screens/AdminDashboardPage"), { ssr: false }),
  explore: dynamic(() => import("../screens/ExplorePage"), { ssr: false }),
};

export default function ClientPage({ page, ...props }) {
  const stayPage = page === "stayDetail" || page === "booking";
  const stay = stayPage ? stays.find((item) => item.slug === props.slug) : null;
  if (stayPage && !stay) {
    const NotFound = screens.explore;
    return <NotFound title="Stay not found" description="We couldn’t find that property. Browse our collection to find your next escape." />;
  }
  const Screen = screens[page] || screens.explore;
  if (stayPage) return <Screen stay={stay} />;
  return <Screen {...props} />;
}
