import React from 'react'
import { Search, Plus, Download, LogOut } from 'lucide-react'


export default function Header({
  title = "Command Center",
  dateText = "Tuesday, 06 Oct",
  statusText = "All systems live",
  lastSync = "12s ago",
  admin,
  onLogout,
  onSearchChange,
  onExport,
  onQuickAction
}) {
  return (
    <header className="app-header">
      {/* Left Title & Status Section */}
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <div className="header-subtitle">
          <span>{dateText}</span>
          <span className="dot-separator">•</span>
          <span>{statusText}</span>
          <span className="dot-separator">•</span>
          <span>Last sync {lastSync}</span>
        </div>
      </div>

      {/* Right Controls & User Profile Section */}
      <div className="header-right">
        {/* Search Bar with Shortcut Badge */}
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search user, order, ICCID..."
            className="search-input"
            onChange={onSearchChange}
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>

        {/* Export Button */}
        <button className="btn-export" onClick={onExport}>
          Export
        </button>

        {/* Quick Action Button */}
        <button className="btn-quick-action" onClick={onQuickAction}>
          <Plus size={14} strokeWidth={2.5} />
          <span>Quick action</span>
        </button>

        {/* User Avatar with Green Online Status Indicator */}
        <button type="button" className="avatar-wrapper" onClick={onLogout} title={`Sign out ${admin?.name || 'admin'}`}>
          <div className="avatar-circle">{admin?.name?.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AD'}</div>
          <span className="status-indicator"></span>
        </button>
        <button type="button" className="btn-export" onClick={onLogout} aria-label="Log out">
          <LogOut size={14} /> Log out
        </button>
      </div>
    </header>
  )
}