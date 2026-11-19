"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, errorStatus, foodApi, getSession, type FoodOrder, type FoodSession } from "../lib/foodApi";
import { FoodHeader, FoodFooter } from "./FoodShell";

const orderStatuses = ["Received", "Preparing", "On the way", "Delivered", "Cancelled"];
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

function PortalHeader({ session, title }: { session: FoodSession | null; title: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  async function signOut() {
    try {
      await foodApi.logout();
      clearSession();
      router.replace("/");
    } catch (error) {
      if (errorStatus(error) === 401) {
        clearSession();
        router.replace("/");
      } else setError(error instanceof Error ? error.message : "Could not sign out.");
    }
  }
  return <><header className="portal-header"><Link className="food-brand" href="/">Sizzle<span>&</span>Smile</Link><span>{title} · {session?.user.name || ""}</span><button type="button" onClick={signOut}>Sign out</button></header>{error && <p className="food-error portal-signout-error" role="alert">{error}</p>}</>;
}

export function ClientDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<FoodSession | null>(null);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (!current) { router.replace(`/login?next=${encodeURIComponent("/dashboard")}`); return; }
    if (current.user.role !== "client") { router.replace("/admin"); return; }
    foodApi.clientDashboard()
      .then((result) => setOrders(result.orders))
      .catch((requestError) => {
        if (errorStatus(requestError) === 401) { clearSession(); router.replace("/login"); }
        else setError(requestError instanceof Error ? requestError.message : "Could not load orders.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  return <><PortalHeader session={session} title="My account" /><main className="portal-content"><span className="food-kicker">YOUR SIZZLE&SMILE ACCOUNT</span><h1>Your orders</h1><p>Review your recent orders and delivery details.</p>{error && <p className="food-error" role="alert">{error}</p>}{loading ? <p>Loading your orders...</p> : orders.length ? <section className="portal-panel">{orders.map((order) => <OrderRow key={order.id} order={order} />)}</section> : <section className="empty-orders"><h2>No orders yet</h2><p>Your demo orders will appear here.</p><Link className="food-button" href="/">Explore the menu</Link></section>}</main><FoodFooter /></>;
}

export function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<FoodSession | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof foodApi.adminDashboard>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (!current) { router.replace(`/admin/login?next=${encodeURIComponent("/admin")}`); return; }
    if (current.user.role !== "admin") { router.replace("/dashboard"); return; }
    foodApi.adminDashboard()
      .then(setData)
      .catch((requestError) => {
        if (errorStatus(requestError) === 401) { clearSession(); router.replace("/admin/login"); }
        else setError(requestError instanceof Error ? requestError.message : "Could not load admin data.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function updateOrder(id: string, status: string) {
    setBusyId(id);
    setError("");
    try {
      const { order } = await foodApi.updateOrder(id, status);
      setData((current) => current && ({ ...current, recentOrders: current.recentOrders.map((item) => item.id === id ? order : item) }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update order.");
    } finally {
      setBusyId("");
    }
  }

  return <><PortalHeader session={session} title="Admin workspace" /><main className="portal-content"><span className="food-kicker">ADMINISTRATOR ACCESS</span><h1>Operations dashboard</h1><p>Manage demo orders and review registered client accounts.</p>{error && <p className="food-error" role="alert">{error}</p>}{loading ? <p>Loading the admin workspace...</p> : data && <><div className="food-metrics"><Metric title="Clients" value={data.metrics.clients} /><Metric title="All orders" value={data.metrics.orders} /><Metric title="Open orders" value={data.metrics.openOrders} /><Metric title="Delivered sales" value={money(data.metrics.deliveredSales)} /></div><section className="portal-panel"><h2>Recent orders</h2>{data.recentOrders.length ? data.recentOrders.map((order) => <div className="admin-order" key={order.id}><OrderRow order={order} /><label>Status<select value={order.status} disabled={busyId === order.id} onChange={(event) => updateOrder(order.id, event.target.value)}>{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>) : <p>No customer orders yet.</p>}</section><section className="portal-panel"><h2>Clients · {data.clients.length}</h2>{data.clients.map((client) => <p className="client-row" key={client.id}><b>{client.name}</b> · {client.email}{client.phone ? ` · ${client.phone}` : ""}</p>)}</section></>}</main><FoodFooter /></>;
}

function OrderRow({ order }: { order: FoodOrder }) {
  return <article className="order-row"><div><b>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</b><small>{order.address} · {order.phone}</small><small>{order.id} · {new Date(order.createdAt).toLocaleString()}</small></div><div><strong>{money(order.total)}</strong><span>{order.status}</span></div></article>;
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return <article><small>{title}</small><strong>{value}</strong></article>;
}
