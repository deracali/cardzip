import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Landmark,
  Receipt,
  MessageSquare,
  ShoppingBag,
  Package,
  Smartphone,
  Store,
  Megaphone,
  Gift,
  FileText,
  History,
  KeyRound,
  ShieldCheck,
  Clock3,
  CircleDollarSign,
  SlidersHorizontal,
  LifeBuoy,
  Flag,
  Menu,
  LogOut,
  X,
} from 'lucide-react'



const navSections = [
  {
    group: null,
    items: [
      { name: 'Overview', tab: 'Overview', icon: LayoutDashboard },
      { name: 'Users', tab: 'Users', icon: Users },
      { name: 'KYC Reviews', tab: 'KYC Reviews', icon: ShieldCheck, requiredPermission: 'Users' },
      { name: 'Treasury', tab: 'Treasury', icon: Landmark },
      { name: 'Bill Payments', tab: 'Bill Payments', icon: Receipt },
      { name: 'Virtual Numbers', tab: 'Virtual Numbers', icon: MessageSquare },
      { name: 'Orders', tab: 'E-Commerce', icon: ShoppingBag },
      { name: 'Store Products', tab: 'Store Products', icon: Package },
      { name: 'Digital Submissions', tab: 'Digital Submissions', icon: Smartphone },
      { name: 'Shop Verification', tab: 'Shop Verification', icon: Store },
      { name: 'Marketplace Promotions', tab: 'Marketplace Promotions', icon: Megaphone },
      { name: 'Banner Ads', tab: 'Banner Ads', icon: Megaphone },
      { name: 'Gift Cards', tab: 'Gift Cards', icon: Gift, badge: 'X', isAltBadge: true },
     
    ],
  },
  {
    group: 'Staff',
    items: [
      { name: 'Staff', tab: 'Staff', icon: KeyRound },
    ],
  },
  {
    group: 'Operations',
    items: [
      { name: 'Admin Wallet', tab: 'Admin Wallet', icon: Landmark },
      { name: 'Add Money', tab: 'Add Money', icon: Receipt },
      { name: 'Withdrawals', tab: 'Withdrawals', icon: Landmark },
      { name: 'Trade History', tab: 'Trade History', icon: History },
      { name: 'Pending Gift Card Reviews', tab: 'Pending Gift Card Reviews', icon: FileText },
      { name: 'Expenses', tab: 'Expenses', icon: CircleDollarSign },
      { name: 'Company Letterhead', tab: 'Company Letterhead', icon: FileText, administratorOnly: true },
      { name: 'WhatsApp Inbox', tab: 'WhatsApp Inbox', icon: MessageSquare, administratorOnly: true },
      { name: 'Support Inbox', tab: 'Support Inbox', icon: LifeBuoy, administratorOnly: true },
      { name: 'Marketplace Reports', tab: 'Marketplace Reports', icon: Flag, administratorOnly: true },
      { name: 'Service Visibility', tab: 'Service Visibility', icon: SlidersHorizontal, administratorOnly: true },
    ],
  },
  {
    group: 'Account',
    items: [
      { name: 'Profile', tab: 'Profile', icon: ShieldCheck },
    ],
  },
]

export default function Sidebar({ activeTab = 'Overview', setActiveTab, admin, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (tabName) => {
    if (setActiveTab) setActiveTab(tabName)
    setIsOpen(false)
  }

  return (
    <div className="sidebar-container">
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div className="brand-mobile">
          <span className="brand-icon"><img src="/cardzip-logo.jpg" alt="" /></span>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Cardzip</span>
          <span className="live-badge">{admin?.role?.toUpperCase() || 'ADMIN'}</span>
        </div>
        <button
          type="button"
          className="hamburger-btn"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Component */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {/* Header Brand */}
          <div className="brand-header">
            <div className="brand-left">
              <span className="brand-icon"><img src="/cardzip-logo.jpg" alt="" /></span>
              <div>
                <div className="brand-title">Cardzip</div>
                <div className="brand-subtitle">{admin?.role?.toUpperCase() || 'ADMIN'}</div>
              </div>
            </div>
            <div className="live-badge">
              <span className="live-dot" />
              Live
            </div>
          </div>

          {/* User Profile */}
          <div className="user-card">
            <div className="user-avatar">{admin?.name?.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AD'}</div>
            <div className="user-info">
              <span className="user-name">{admin?.name || 'Admin'}</span>
              <span className="user-role">{admin?.role || 'Admin'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="nav-menu">
            {[...navSections.map((section) => ({
              ...section,
              items: section.items.filter((item) =>
                (admin?.role !== 'staff'
                  || admin.visiblePages?.includes(item.requiredPermission || item.tab)
                  || (['E-Commerce', 'Store Products', 'Digital Submissions', 'Shop Verification', 'Marketplace Promotions', 'Banner Ads'].includes(item.tab)
                    && admin.visiblePages?.includes('E-Commerce')))
                && (!item.administratorOnly || admin?.role !== 'staff')
              ),
            })), ...(admin?.role === 'staff' ? [{ group: 'My work', items: [
              { name: 'My Tasks', tab: 'My Tasks', icon: KeyRound },
              { name: 'Clock In / Out', tab: 'My Attendance', icon: Clock3 },
            ] }] : [])].map((section, idx) => (
              <div key={idx} className="nav-group">
                {section.items.length === 0 ? null : (
                  <>
                {section.group && (
                  <div className="nav-group-header">{section.group}</div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.tab

                  return (
                    <button
                      key={item.name}
                      onClick={() => handleSelect(item.tab)}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      <div className="nav-link-left">
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </div>

                      {item.tab === 'Users' && admin?.totalUsers != null && Number.isFinite(Number(admin.totalUsers)) && (
                        <span className="nav-badge">{Number(admin.totalUsers).toLocaleString()}</span>
                      )}
                      {item.badge && (
                        <span
                          className={`nav-badge ${
                            item.isAltBadge ? 'alt' : ''
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>

      <div className="sidebar-bottom">
        <div className="health-card">
          <div className="health-card-content">
            <div className="health-title">System float healthy</div>
            <div className="health-desc">All rails operational • 99.98%</div>
          </div>
        </div>
        <button type="button" className="sidebar-logout-button" onClick={onLogout}>
          <LogOut size={17} /> Log out
        </button>
      </div>
      </aside>
    </div>
  )
}