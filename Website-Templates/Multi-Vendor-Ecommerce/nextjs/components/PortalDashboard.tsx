"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  clearMarketplaceSession,
  getMarketplaceSession,
  marketplaceApi,
  type MarketDashboard,
  type MarketRole,
} from "../lib/marketplaceApi";

const portalPaths: Record<MarketRole, string> = {
  client: "/dashboard",
  vendor: "/vendor/dashboard",
  admin: "/admin",
};

const loginPaths: Record<MarketRole, string> = {
  client: "/login",
  vendor: "/login",
  admin: "/admin/login",
};

export default function PortalDashboard({ role }: { role: MarketRole }) {
  const router = useRouter();
  const [data, setData] = useState<MarketDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", description: "", price: "", stock: "1", image: "" });

  useEffect(() => {
    let active = true;
    const session = getMarketplaceSession();
    if (!session?.token) {
      router.replace(`${loginPaths[role]}?redirect=${encodeURIComponent(portalPaths[role])}`);
      return () => { active = false; };
    }
    const load = role === "admin"
      ? marketplaceApi.adminDashboard()
      : role === "vendor"
        ? marketplaceApi.vendorDashboard()
        : marketplaceApi.clientDashboard();
    load.then((result) => {
      if (active) setData(result);
    }).catch((requestError: Error & { status?: number }) => {
      if (!active) return;
      setError(requestError.message);
      if (requestError.status === 401) {
        clearMarketplaceSession();
        router.replace(`${loginPaths[role]}?redirect=${encodeURIComponent(portalPaths[role])}`);
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [role, router]);

  const createProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await marketplaceApi.createProduct({ ...form, price: Number(form.price), stock: Number(form.stock) });
      setData((current) => current ? { ...current, products: [result.product, ...(current.products || [])] } : current);
      setForm({ name: "", category: "", description: "", price: "", stock: "1", image: "" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not list this product.");
    } finally {
      setSaving(false);
    }
  };

  const updateVendor = async (vendorId: string, status: "approved" | "rejected") => {
    setError("");
    try {
      const result = await marketplaceApi.updateVendorStatus(vendorId, status);
      setData((current) => current ? {
        ...current,
        vendors: (current.vendors || []).map((vendor) => vendor.id === vendorId ? result.vendor : vendor),
        metrics: current.metrics ? { ...current.metrics, pendingVendors: Math.max(0, current.metrics.pendingVendors - 1) } : undefined,
      } : current);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update the vendor application.");
    }
  };

  const updateOrder = async (orderId: string, status: string) => {
    setError("");
    try {
      const result = await marketplaceApi.updateOrderStatus(orderId, status);
      setData((current) => current ? { ...current, orders: current.orders.map((order) => order.id === orderId ? result.order : order) } : current);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update the order.");
    }
  };

  const signOut = () => {
    clearMarketplaceSession();
    router.push("/");
  };

  if (loading) return <main className="market-portal-page"><p className="market-state">Loading your secure dashboard…</p></main>;
  if (!data) return <main className="market-portal-page"><p className="market-error" role="alert">{error || "This dashboard could not be loaded."}</p><button className="market-button market-button-secondary" onClick={() => router.push("/")}>Back to MarketHub</button></main>;
  if (data.user.role !== role) return <main className="market-portal-page"><p className="market-error" role="alert">Your account is not permitted to access this portal.</p><button className="market-button market-button-secondary" onClick={() => router.push("/")}>Back to MarketHub</button></main>;

  return <main className="market-portal-page">
    <header className="market-portal-heading"><div><span className="market-eyebrow">MARKETHUB PORTAL</span><h1>{role === "admin" ? "Marketplace administration" : role === "vendor" ? "Seller studio" : "Your orders"}</h1><p>{role === "admin" ? "Review vendors and manage marketplace orders." : role === "vendor" ? "Manage your listings and monitor buyer orders." : "Review payment and delivery updates."}</p></div><div className="market-user-summary"><strong>{data.user.name}</strong><span>{data.user.email}</span><button onClick={signOut}>Sign out</button></div></header>
    {error && <p className="market-error" role="alert">{error}</p>}
    {role === "client" && <section className="market-portal-card"><h2>Order history</h2>{data.orders.length ? <div className="market-order-list">{data.orders.map((order) => <article key={order.id}><div><strong>{order.orderNumber}</strong><span>{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items</span></div><span className="market-status">{order.status}</span><strong>${order.total.toFixed(2)}</strong><small>{order.paymentStatus}</small></article>)}</div> : <p className="market-state">Your orders will appear here after checkout.</p>}</section>}
    {role === "vendor" && <>
      {data.user.vendorStatus !== "approved" && <section className="market-review-note"><strong>Seller application {data.user.vendorStatus}.</strong><p>An administrator must approve your shop before product listings can be published.</p></section>}
      <div className="market-dashboard-grid"><section className="market-portal-card"><h2>Your products</h2>{data.products?.length ? data.products.map((product) => <article className="market-list-row" key={product.id}><span>{product.name}<small>{product.category} · {product.stock} in stock</small></span><strong>${product.price.toFixed(2)}</strong></article>) : <p className="market-state">No product listings yet.</p>}</section>
        {data.user.vendorStatus === "approved" && <section className="market-portal-card"><h2>List a product</h2><form className="market-form" onSubmit={createProduct}>
          <label>Product name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={120} /></label>
          <label>Category<input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} required maxLength={80} /></label>
          <label>Description<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required minLength={10} maxLength={1200} rows={3} /></label>
          <div className="market-form-pair"><label>Price (USD)<input type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required min="0.01" step="0.01" /></label><label>Stock<input type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} required min="0" /></label></div>
          <label>Image URL<input type="url" value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://" /></label>
          <button className="market-button market-button-primary" disabled={saving}>{saving ? "Saving…" : "Publish product"}</button>
        </form></section>}
        <section className="market-portal-card market-wide"><h2>Orders with your products</h2>{data.orders.length ? data.orders.map((order) => <article className="market-list-row" key={order.id}><span>{order.orderNumber}<small>{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</small></span><span className="market-status">{order.status}</span></article>) : <p className="market-state">Orders for your products will appear here.</p>}</section>
      </div>
    </>}
    {role === "admin" && <>
      <div className="market-metric-grid">{Object.entries(data.metrics || {}).slice(0, 6).map(([label, value]) => <article key={label}><span>{label.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</span><strong>{typeof value === "number" ? label === "orderValue" ? `$${value.toFixed(2)}` : value : 0}</strong></article>)}</div>
      <section className="market-portal-card"><h2>Pending vendor applications</h2>{(data.vendors || []).filter((vendor) => vendor.vendorStatus === "pending").length ? (data.vendors || []).filter((vendor) => vendor.vendorStatus === "pending").map((vendor) => <article className="market-list-row" key={vendor.id}><span>{vendor.name}<small>{vendor.email}</small></span><span className="market-status">Pending</span><button className="market-small-button" onClick={() => updateVendor(vendor.id, "approved")}>Approve</button><button className="market-small-button secondary" onClick={() => updateVendor(vendor.id, "rejected")}>Reject</button></article>) : <p className="market-state">No pending seller applications.</p>}</section>
      <section className="market-portal-card"><h2>Orders</h2>{data.orders.length ? data.orders.map((order) => <article className="market-list-row" key={order.id}><span>{order.orderNumber}<small>{order.customerName} · ${order.total.toFixed(2)} · {order.paymentStatus}{order.paymentProvider ? ` via ${order.paymentProvider}` : ""}</small></span><span className="market-status">{order.status}</span><select aria-label={`Update ${order.orderNumber} status`} value={order.status} onChange={(event) => updateOrder(order.id, event.target.value)}>{["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Inventory review", "Payment failed", "Payment expired"].map((status) => <option key={status}>{status}</option>)}</select></article>) : <p className="market-state">Orders will appear here after checkout.</p>}</section>
    </>}
  </main>;
}
