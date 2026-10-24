import { Search, Plus } from 'lucide-react'


export default function Header({
  title = "Command Center",
  dateText = "Tuesday, 06 Oct",
  statusText = "All systems live",
  lastSync = "12s ago",
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

      </div>
    </header>
  )
}