import { useState } from "react";
import "./dashboard.css";

// Role system
import { RoleProvider, ROLES, DEFAULT_NAV, useRole } from "./context/RoleContext";

// Layout
import Sidebar from "./components/Sidebar";
import Topbar  from "./components/Topbar";

// Dashboard home panels
import StatsRow            from "./components/StatsRow";
import MapPanel            from "./components/MapPanel";
import ActivityFeed        from "./components/ActivityFeed";
import MissingPersonsTable from "./components/MissingPersonsTable";
import AIMatchPanel        from "./components/AIMatchPanel";

// Full page views
import MissingPersonsExplorer from "./components/MissingPersonsExplorer";
import ReportSighting         from "./components/ReportSighting";
import AIMatchResults         from "./components/AIMatchResults";
import CaseTimeline           from "./components/CaseTimeline";
import Alerts                 from "./components/Alerts";

/* ─── Page views ─────────────────────────────────────────────── */
function DashboardHome() {
  return (
    <>
      <StatsRow />
      <div className="dashboard-mid-row">
        <MapPanel />
        <ActivityFeed />
      </div>
      <div className="dashboard-bottom-row">
        <MissingPersonsTable />
        <AIMatchPanel />
      </div>
    </>
  );
}

function MapTracking() {
  return (
    <div className="map-tracking-page">
      <div>
        <h2 className="page-title">Map Tracking</h2>
        <p className="page-sub">Live sighting locations and AI detections across all connected cameras</p>
      </div>
      <div className="map-tracking-viewport">
        <MapPanel />
      </div>
    </div>
  );
}

function renderView(activeNav) {
  switch (activeNav) {
    case "dashboard": return <DashboardHome />;
    case "missing":   return <MissingPersonsExplorer />;
    case "sighting":  return <ReportSighting />;
    case "ai-match":  return <AIMatchResults />;
    case "map":       return <MapTracking />;
    case "timeline":  return <CaseTimeline />;
    case "alerts":    return <Alerts />;
    default:          return <DashboardHome />;
  }
}

/* ─── Inner shell — lives inside RoleProvider ─────────────────── */
function DashboardShell({ onRoleChange }) {
  const { role } = useRole();
  const [activeNav, setActiveNav] = useState(() => DEFAULT_NAV[role]);

  // When the role-switcher fires, reset nav to the new role's default page
  const handleRoleChange = (newRole) => {
    onRoleChange(newRole);
    setActiveNav(DEFAULT_NAV[newRole]);
  };

  return (
    <div className="dashboard-shell">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <div className="dashboard-main">
        <Topbar onRoleChange={handleRoleChange} />
        <main className="dashboard-content">
          {renderView(activeNav)}
        </main>
      </div>
    </div>
  );
}

/* ─── Root export ─────────────────────────────────────────────── */
/**
 * Usage in your router / app:
 *
 *   <Dashboard role={currentUser.role} />
 *
 * Valid role values: "officer" | "partner" | "citizen"
 * Pass the role from your auth context/JWT — Dashboard is fully controlled externally.
 * The demo role-switcher in the Topbar is available during development.
 */
export default function Dashboard({ role: initialRole = ROLES.OFFICER }) {
  // Lift role state here so the Topbar switcher can update it
  const [role, setRole] = useState(initialRole);

  return (
    <RoleProvider role={role}>
      <DashboardShell onRoleChange={setRole} />
    </RoleProvider>
  );
}
