"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { stays } from "../data/stays";
import { escapesApi } from "../services/escapesApi";

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
  const staticStay = stayPage ? stays.find((item) => item.slug === props.slug) : null;
  const [remoteStay, setRemoteStay] = useState(null);
  const [stayError, setStayError] = useState("");

  useEffect(() => {
    if (!stayPage || staticStay || !props.slug) return undefined;
    let active = true;
    escapesApi.publicStay(props.slug)
      .then(({ stay }) => { if (active) setRemoteStay(stay); })
      .catch((error) => { if (active) setStayError(error.message); });
    return () => { active = false; };
  }, [page, props.slug, staticStay, stayPage]);

  const stay = staticStay || remoteStay;
  if (stayPage && !stay && stayError) {
    const NotFound = screens.explore;
    return <NotFound title="Property unavailable" description={stayError} />;
  }
  if (stayPage && !stay) return <p className="dashboard-loading">Loading property details…</p>;
  const Screen = screens[page] || screens.explore;
  if (stayPage) return <Screen stay={stay} />;
  return <Screen {...props} />;
}
