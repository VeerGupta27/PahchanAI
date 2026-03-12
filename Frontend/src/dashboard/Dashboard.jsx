import { useState } from "react";
import "./dashboard.css";

// Role system
import { RoleProvider, ROLES, DEFAULT_NAV, useRole } from "./context/RoleContext";

// Layout
import Sidebar  from "./components/Sidebar";
import Topbar   from "./components/Topbar";

// Dashboard home panels
import StatsRow      from "./components/StatsRow";
import LiveFeed      from "./components/LiveFeed";       // merged: ActivityFeed + Alerts
import MissingPersons from "./components/MissingPersons"; // merged: Explorer + Table
import AIMatches     from "./components/AIMatches";      // merged: AIMatchPanel + AIMatchResults

// Full page views
import ReportSighting from "./components/ReportSighting";
import CaseTimeline   from "./components/CaseTimeline";

/* ─── Dashboard home layout ──────────────────────────────────── */
function DashboardHome() {
  return (
    <>
      <StatsRow />
      <div className="dashboard-mid-row">
        <LiveFeed />
      </div>
      <div className="dashboard-bottom-row">
        <MissingPersons />
        <AIMatches panel />
      </div>
    </>
  );
}

/* ─── Page router ────────────────────────────────────────────── */
function renderView(activeNav) {
  switch (activeNav) {
    case "dashboard": return <DashboardHome />;
    case "missing":   return <MissingPersons />;
    case "sighting":  return <ReportSighting />;
    case "ai-match":  return <AIMatches />;
    case "timeline":  return <CaseTimeline />;
    case "alerts":    return <LiveFeed />;   // LiveFeed shows Alerts tab by default when routed here
    default:          return <DashboardHome />;
  }
}

/* ─── Inner shell ────────────────────────────────────────────── */
function DashboardShell({ onRoleChange }) {
  const { role } = useRole();
  const [activeNav, setActiveNav] = useState(() => DEFAULT_NAV[role]);

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

/* ─── Root export ────────────────────────────────────────────── */
/**
 * Usage:
 *   <Dashboard role={currentUser.role} />
 *
 * Valid roles: "officer" | "partner" | "citizen"
 */
export default function Dashboard({ role: initialRole = ROLES.OFFICER }) {
  const [role, setRole] = useState(initialRole);
  return (
    <RoleProvider role={role}>
      <DashboardShell onRoleChange={setRole} />
    </RoleProvider>
  );
}
