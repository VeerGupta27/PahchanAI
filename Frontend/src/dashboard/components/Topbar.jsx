import "./dashboard.css";
import { useRole, ROLES, ROLE_META } from "../context/RoleContext";

export default function Topbar({ onRoleChange }) {
  const { role, meta } = useRole();

  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar-search">
        <svg className="topbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Search cases, names, locations…" />
      </div>

      <div className="topbar-right">
        {/* Live indicator */}
        <div className="topbar-status">
          <span className="topbar-status-dot" />
          Live
        </div>

        {/* ── Demo role switcher ───────────────────────────────── */}
        {onRoleChange && (
          <div className="topbar-role-switcher">
            <span className="topbar-role-switcher-label">View as:</span>
            {Object.values(ROLES).map((r) => {
              const m = ROLE_META[r];
              return (
                <button
                  key={r}
                  className={`topbar-role-btn${role === r ? " active" : ""}`}
                  style={role === r ? { color: m.color, borderColor: m.color + "55", background: m.color + "15" } : {}}
                  onClick={() => onRoleChange(r)}
                  title={m.description}
                >
                  {m.badge}
                </button>
              );
            })}
          </div>
        )}

        {/* Notifications */}
        <div className="topbar-icon-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="topbar-notif-dot" />
        </div>

        {/* Avatar with role color */}
        <div
          className="topbar-avatar"
          style={{ background: `linear-gradient(135deg, ${meta.color}88, ${meta.color}44)`, borderColor: meta.color + "55" }}
          title={meta.label}
        >
          {meta.initials}
        </div>
      </div>
    </header>
  );
}
