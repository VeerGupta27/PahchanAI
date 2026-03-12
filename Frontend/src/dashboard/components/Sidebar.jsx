import "./dashboard.css";
import { useRole, ROLE_META } from "../context/RoleContext";
import RoleBadge from "../RoleBadge";

/* ─── All possible nav items ────────────────────────────────── */
const NAV_ITEMS = [
  {
    id: "dashboard",
    permission: "nav_dashboard",
    label: "Dashboard",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    id: "missing",
    permission: "nav_missing",
    label: "Missing Persons",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: "sighting",
    permission: "nav_sighting",
    label: "Report Sighting",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
      </svg>
    ),
  },
  {
    id: "ai-match",
    permission: "nav_ai_match",
    label: "AI Match Results",
    badge: 3,
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <circle cx="11" cy="11" r="3"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  
  {
    id: "timeline",
    permission: "nav_timeline",
    label: "Case Timeline",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    id: "alerts",
    permission: "nav_alerts",
    label: "Alerts",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
];

export default function Sidebar({ activeNav, onNavChange }) {
  const { role, can, meta } = useRole();

  // Only show nav items this role is permitted to see
  const visibleItems = NAV_ITEMS.filter((item) => can(item.permission));

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <span className="sidebar-logo-text">Pahchan<span>AI</span></span>
      </div>

      {/* Nav — filtered by role */}
      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-nav-item${activeNav === item.id ? " active" : ""}`}
            onClick={() => onNavChange(item.id)}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
            {item.badge && can("nav_ai_match") && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Role indicator */}
      <div className="sidebar-role-section">
        <div className="sidebar-role-label">Signed in as</div>
        <div className="sidebar-role-row">
          <div className="sidebar-role-dot" style={{ background: meta.color }} />
          <span className="sidebar-role-name" style={{ color: meta.color }}>{meta.label}</span>
        </div>
        <div className="sidebar-role-desc">{meta.description}</div>
      </div>

      {/* User */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ background: `linear-gradient(135deg, ${meta.color}88, ${meta.color}44)`, border: `1.5px solid ${meta.color}55` }}>
            {meta.initials}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Current User</div>
            <RoleBadge size="sm" />
          </div>
        </div>
      </div>
    </aside>
  );
}
