"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bike,
  CircleDollarSign,
  Clock3,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  PackageCheck,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Utensils,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { clearSession, errorStatus, foodApi, getSession, type FoodOrder, type FoodRole, type FoodSession, type FoodUser } from "../lib/foodApi";
import { dishes, imageUrl } from "../lib/menu";
import { formatMoney } from "../lib/money";

const orderStatuses = ["Received", "Preparing", "On the way", "Delivered", "Cancelled"];
const favoriteKey = "sizzle-smile-favorites";

type ViewId = "overview" | "orders" | "addresses" | "favorites" | "account" | "customers" | "menu" | "settings";
type NavigationItem = { id: ViewId; label: string; icon: LucideIcon };

const clientNavigation: NavigationItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "My orders", icon: ShoppingBag },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "account", label: "Account", icon: Settings },
];
const adminNavigation: NavigationItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "customers", label: "Customers", icon: Users },
  { id: "menu", label: "Menu preview", icon: Utensils },
  { id: "settings", label: "Settings", icon: Settings },
];

function DashboardSidebar({
  role,
  user,
  activeView,
  onNavigate,
  onSignOut,
  open,
  onClose,
}: {
  role: FoodRole;
  user: FoodUser | null;
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  onSignOut: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const isAdmin = role === "admin";
  const navigation = isAdmin ? adminNavigation : clientNavigation;
  return (
    <>
      {open && <button className="portal-overlay" type="button" aria-label="Close dashboard menu" onClick={onClose} />}
      <aside className={`portal-sidebar${open ? " is-open" : ""}`}>
        <div className="portal-brand">
          <span className="portal-brand-mark"><Utensils size={17} /></span>
          <span><strong>Sizzle<span>&</span>Smile</strong><small>{isAdmin ? "ADMIN WORKSPACE" : "YOUR ACCOUNT"}</small></span>
          <button className="portal-close" type="button" aria-label="Close dashboard menu" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="portal-workspace-label">WORKSPACE</div>
        <nav className="portal-nav" aria-label={`${isAdmin ? "Admin" : "User"} dashboard`}>
          {navigation.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} className={activeView === id ? "active" : ""} onClick={() => onNavigate(id)}>
              <Icon size={17} /><span>{label}</span>{activeView === id && <span className="portal-nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="portal-sidebar-bottom">
          <Link className="portal-help-link" href="/delivery"><Bike size={16} /><span><strong>Need a hand?</strong><small>View delivery help</small></span><ArrowUpRight size={14} /></Link>
          <div className="portal-profile">
            <span className="portal-avatar">{user?.name.slice(0, 1).toUpperCase() || (isAdmin ? "A" : "U")}</span>
            <span className="portal-profile-copy"><strong>{user?.name || "Guest"}</strong><small>{user?.email || "Signed out"}</small></span>
            <button type="button" aria-label="Sign out" title="Sign out" onClick={onSignOut}><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function DashboardFrame({
  role,
  session,
  activeView,
  onNavigate,
  onSignOut,
  sidebarOpen,
  onMenuClick,
  onClose,
  children,
}: {
  role: FoodRole;
  session: FoodSession | null;
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  onSignOut: () => void;
  sidebarOpen: boolean;
  onMenuClick: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`portal-shell${role === "admin" ? " portal-admin-shell" : ""}`}>
      <DashboardSidebar role={role} user={session?.user || null} activeView={activeView} onNavigate={onNavigate} onSignOut={onSignOut} open={sidebarOpen} onClose={onClose} />
      <div className="portal-workspace">
        <header className="portal-topbar">
          <button className="portal-menu-button" type="button" aria-label="Open dashboard menu" onClick={onMenuClick}><Menu size={19} /></button>
          <div className="portal-breadcrumb">Sizzle&Smile <span>/</span> {role === "admin" ? "Admin workspace" : "My account"}</div>
          <div className="portal-topbar-user"><span className="portal-online-dot" /> API connected <span className="portal-avatar small">{session?.user.name.slice(0, 1).toUpperCase() || "U"}</span></div>
        </header>
        <main className="portal-main">
          <div className="portal-demo-note"><ShieldCheck size={14} /> {role === "admin" ? "Administrator workspace · API-backed data" : "Customer dashboard · API-backed orders"}</div>
          {children}
        </main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="portal-page-heading">
      <div><span className="portal-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone }: { label: string; value: string | number; detail: string; icon: LucideIcon; tone?: string }) {
  return <article className={`portal-metric ${tone || ""}`}><span className="portal-metric-icon"><Icon size={18} /></span><small>{label}</small><strong>{value}</strong><span className="portal-metric-detail">{detail}</span></article>;
}

function OrderList({ orders, admin = false, onStatusChange, busyId }: { orders: FoodOrder[]; admin?: boolean; onStatusChange?: (id: string, status: string) => void; busyId?: string }) {
  if (!orders.length) return <div className="portal-empty"><ShoppingBag size={24} /><strong>No orders yet</strong><span>Your order activity will appear here.</span></div>;
  return (
    <div className="portal-order-list">
      {orders.map((order) => (
        <article className="portal-order-row" key={order.id}>
          <span className="portal-order-icon"><ShoppingBag size={17} /></span>
          <div className="portal-order-main">
            <strong>{admin ? order.clientName : order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}</strong>
            <span>{admin ? `${order.address} · ${order.phone}` : order.address}</span>
            <small>{order.id} · {new Date(order.createdAt).toLocaleString()}</small>
          </div>
          <strong className="portal-order-total">{formatMoney(order.total)}</strong>
          {admin ? (
            order.paymentStatus === "paid"
              ? <select aria-label={`Update order status for ${order.id}`} disabled={busyId === order.id} value={order.status} onChange={(event) => onStatusChange?.(order.id, event.target.value)}>
                {orderStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
              : <span className="portal-status awaiting-payment">Awaiting payment</span>
          ) : <span className={`portal-status ${order.status.toLowerCase().replaceAll(" ", "-")}`}>{order.status}</span>}
        </article>
      ))}
    </div>
  );
}

function ClientOverview({ session, orders, onNavigate }: { session: FoodSession; orders: FoodOrder[]; onNavigate: (view: ViewId) => void }) {
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const activeOrders = paidOrders.filter((order) => !["Delivered", "Cancelled"].includes(order.status));
  const delivered = paidOrders.filter((order) => order.status === "Delivered").length;
  const spent = paidOrders.reduce((sum, order) => sum + order.total, 0);
  return (
    <>
      <PageHeading eyebrow="CUSTOMER DASHBOARD" title={`Welcome back, ${session.user.name.split(" ")[0]}`} description="Your meals and delivery updates, all in one place." action={<Link className="portal-primary-button" href="/">Explore menu <ArrowUpRight size={15} /></Link>} />
      <div className="portal-metric-grid">
        <MetricCard label="Total orders" value={orders.length} detail="Since you joined" icon={ShoppingBag} />
        <MetricCard label="On the way" value={activeOrders.length} detail="Orders in progress" icon={Bike} tone="warm" />
        <MetricCard label="Delivered" value={delivered} detail="Meals enjoyed" icon={PackageCheck} tone="green" />
        <MetricCard label="Order total" value={formatMoney(spent)} detail="Paid order total" icon={CircleDollarSign} tone="blue" />
      </div>
      <section className="portal-panel">
        <div className="portal-panel-heading"><div><h2>Recent orders</h2><p>Your latest activity</p></div><button type="button" className="portal-text-button" onClick={() => onNavigate("orders")}>View all <ArrowUpRight size={14} /></button></div>
        <OrderList orders={orders.slice(0, 4)} />
      </section>
    </>
  );
}

function ClientView({ view, session, orders, onNavigate }: { view: ViewId; session: FoodSession; orders: FoodOrder[]; onNavigate: (view: ViewId) => void }) {
  if (view === "overview") return <ClientOverview session={session} orders={orders} onNavigate={onNavigate} />;
  if (view === "orders") return <><PageHeading eyebrow="ORDER HISTORY" title="My orders" description="Review order details and delivery progress." /><section className="portal-panel"><OrderList orders={orders} /></section></>;
  if (view === "addresses") {
    const addresses = [...new Set(orders.map((order) => order.address).filter(Boolean))];
    return <><PageHeading eyebrow="DELIVERY DETAILS" title="Saved addresses" description="Addresses used for your recent orders." /><section className="portal-panel">{addresses.length ? addresses.map((address) => <article className="portal-simple-row" key={address}><MapPin size={17} /><span><strong>{address}</strong><small>Delivery address</small></span></article>) : <div className="portal-empty"><MapPin size={23} /><strong>No saved addresses</strong><span>Your checkout addresses will appear here.</span></div>}</section></>;
  }
  if (view === "favorites") return <FavoriteDishes />;
  return <><PageHeading eyebrow="ACCOUNT SETTINGS" title="Your account" description="Your profile details and account activity." /><section className="portal-panel portal-account-card"><span className="portal-avatar large">{session.user.name.slice(0, 1).toUpperCase()}</span><div><h2>{session.user.name}</h2><p>{session.user.email}</p>{session.user.phone && <p>{session.user.phone}</p>}</div><span className="portal-status">Customer</span></section></>;
}

function FavoriteDishes() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteKey) || "[]");
      if (Array.isArray(saved)) setFavoriteIds(saved.filter((id): id is string => typeof id === "string"));
    } catch {
      setFavoriteIds([]);
    }
  }, []);
  function toggleFavorite(id: string) {
    const next = favoriteIds.includes(id) ? favoriteIds.filter((item) => item !== id) : [...favoriteIds, id];
    localStorage.setItem(favoriteKey, JSON.stringify(next));
    setFavoriteIds(next);
  }
  const favorites = dishes.filter((dish) => favoriteIds.includes(dish.id));
  return (
    <>
      <PageHeading eyebrow="YOUR PICKS" title="Favorites" description="Save the dishes you want to order again." />
      {favorites.length ? <div className="portal-favorites-grid">{favorites.map((dish) => <article className="portal-favorite-card" key={dish.id}><img src={imageUrl(dish.photo)} alt={dish.name} /><div><small>{dish.category} · ★ {dish.rating}</small><h2>{dish.name}</h2><p>{dish.restaurant}</p><strong>{formatMoney(dish.price)}</strong><button type="button" className="portal-text-button" onClick={() => toggleFavorite(dish.id)}><Heart size={14} fill="currentColor" /> Remove favorite</button></div></article>)}</div> : <section className="portal-panel"><div className="portal-empty"><Heart size={24} /><strong>No saved favorites yet</strong><span>Open the menu below and save a dish to see it here.</span><Link className="portal-primary-button" href="/">Explore the menu <ArrowUpRight size={14} /></Link></div></section>}
      <section className="portal-panel"><div className="portal-panel-heading"><div><h2>Popular picks</h2><p>Add a dish to your favorites</p></div></div><div className="portal-favorites-grid">{dishes.slice(0, 4).map((dish) => <article className="portal-favorite-card" key={dish.id}><img src={imageUrl(dish.photo)} alt={dish.name} /><div><small>{dish.category} · ★ {dish.rating}</small><h2>{dish.name}</h2><p>{dish.restaurant}</p><strong>{formatMoney(dish.price)}</strong><button type="button" className="portal-text-button" onClick={() => toggleFavorite(dish.id)}><Heart size={14} fill={favoriteIds.includes(dish.id) ? "currentColor" : "none"} /> {favoriteIds.includes(dish.id) ? "Saved" : "Save favorite"}</button></div></article>)}</div></section>
    </>
  );
}

export function ClientDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<FoodSession | null>(null);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  async function signOut() {
    try {
      await foodApi.logout();
      clearSession();
      router.replace("/");
    } catch (requestError) {
      if (errorStatus(requestError) === 401) { clearSession(); router.replace("/"); }
      else setError(requestError instanceof Error ? requestError.message : "Could not sign out.");
    }
  }

  if (loading) return <main className="portal-loading">Opening your dashboard…</main>;
  if (!session) return null;

  return (
    <DashboardFrame role="client" session={session} activeView={activeView} onNavigate={(view) => { setActiveView(view); setSidebarOpen(false); }} onSignOut={signOut} sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} onClose={() => setSidebarOpen(false)}>
      {error && <p className="food-error" role="alert">{error}</p>}
      {!error && <ClientView view={activeView} session={session} orders={orders} onNavigate={setActiveView} />}
    </DashboardFrame>
  );
}

function AdminView({ view, data, session, onNavigate, onStatusChange, busyId }: {
  view: ViewId;
  data: Awaited<ReturnType<typeof foodApi.adminDashboard>>;
  session: FoodSession;
  onNavigate: (view: ViewId) => void;
  onStatusChange: (id: string, status: string) => void;
  busyId: string;
}) {
  if (view === "overview") {
    return (
      <>
        <PageHeading eyebrow="ADMIN WORKSPACE" title="Operations overview" description="A clear view of today's sample orders and customers." action={<span className="portal-live-badge"><span /> API connected</span>} />
        <div className="portal-metric-grid">
          <MetricCard label="Customers" value={data.metrics.clients} detail="Registered client accounts" icon={Users} />
          <MetricCard label="All orders" value={data.metrics.orders} detail="Orders in the system" icon={ShoppingBag} />
          <MetricCard label="Open orders" value={data.metrics.openOrders} detail="Awaiting completion" icon={Clock3} tone="warm" />
          <MetricCard label="Delivered sales" value={formatMoney(data.metrics.deliveredSales)} detail="Paid order totals" icon={CircleDollarSign} tone="green" />
        </div>
        <section className="portal-panel"><div className="portal-panel-heading"><div><h2>Latest orders</h2><p>Most recent activity</p></div><button type="button" className="portal-text-button" onClick={() => onNavigate("orders")}>Manage orders <ArrowUpRight size={14} /></button></div><OrderList orders={data.recentOrders.slice(0, 5)} admin onStatusChange={onStatusChange} busyId={busyId} /></section>
      </>
    );
  }
  if (view === "orders") return <><PageHeading eyebrow="ORDER MANAGEMENT" title="Orders" description="Update fulfillment status and review delivery details." /><section className="portal-panel"><OrderList orders={data.recentOrders} admin onStatusChange={onStatusChange} busyId={busyId} /></section></>;
  if (view === "customers") return <><PageHeading eyebrow="CUSTOMER DIRECTORY" title="Customers" description={`${data.clients.length} registered client accounts.`} /><section className="portal-panel">{data.clients.length ? data.clients.map((client) => <article className="portal-simple-row" key={client.id}><span className="portal-avatar">{client.name.slice(0, 1).toUpperCase()}</span><span><strong>{client.name}</strong><small>{client.email}{client.phone ? ` · ${client.phone}` : ""}</small></span></article>) : <div className="portal-empty"><Users size={24} /><strong>No customers yet</strong><span>Registered client accounts will appear here.</span></div>}</section></>;
  if (view === "menu") return <><PageHeading eyebrow="MENU" title="Menu preview" description="Review the current sample menu. Menu editing is not included in the API." /><div className="portal-menu-grid">{dishes.map((dish) => <article className="portal-menu-card" key={dish.id}><img src={imageUrl(dish.photo)} alt={dish.name} /><div><small>{dish.category} · ★ {dish.rating}</small><h2>{dish.name}</h2><p>{dish.restaurant}</p><strong>{formatMoney(dish.price)}</strong></div></article>)}</div></>;
  return <><PageHeading eyebrow="WORKSPACE SETTINGS" title="Settings" description="Administrator profile and service status." /><section className="portal-panel portal-account-card"><span className="portal-avatar large">{session.user.name.slice(0, 1).toUpperCase()}</span><div><h2>{session.user.name}</h2><p>{session.user.email}</p><p>Administrator · Connected to the food delivery API</p></div><span className="portal-live-badge"><span /> Active</span></section></>;
}

export function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<FoodSession | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof foodApi.adminDashboard>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  async function signOut() {
    try {
      await foodApi.logout();
      clearSession();
      router.replace("/");
    } catch (requestError) {
      if (errorStatus(requestError) === 401) { clearSession(); router.replace("/"); }
      else setError(requestError instanceof Error ? requestError.message : "Could not sign out.");
    }
  }

  if (loading) return <main className="portal-loading">Opening the admin workspace…</main>;
  if (!session || !data) return error ? <main className="portal-loading"><p className="food-error" role="alert">{error}</p></main> : null;

  return (
    <DashboardFrame role="admin" session={session} activeView={activeView} onNavigate={(view) => { setActiveView(view); setSidebarOpen(false); }} onSignOut={signOut} sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} onClose={() => setSidebarOpen(false)}>
      {error && <p className="food-error" role="alert">{error}</p>}
      <AdminView view={activeView} data={data} session={session} onNavigate={setActiveView} onStatusChange={updateOrder} busyId={busyId} />
    </DashboardFrame>
  );
}
