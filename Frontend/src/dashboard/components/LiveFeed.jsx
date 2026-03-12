/**
 * LiveFeed.jsx
 * Merges: ActivityFeed + Alerts
 *
 * Single card with two tabs: "Activity" and "Alerts"
 * Usage: <LiveFeed />
 */

import { useState } from "react";
import "./dashboard.css";
import { useRole } from "../context/RoleContext";

/* ── Activity data ──────────────────────────────────────────── */
const ACTIVITIES = [
  { type:"citizen", time:"10:45 AM", text:"Citizen sighting reported: **Mumbai, Near Central Station**",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg> },
  { type:"ai", time:"10:38 AM", text:"AI match detected: **Delhi, CCTV Cam #45A**, 87% similarity",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><circle cx="11" cy="11" r="3"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { type:"review", time:"10:30 AM", text:"Authority reviewing report: **Case #2349, Bangalore**",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg> },
  { type:"citizen", time:"10:21 AM", text:"New case registered: **Priya Mehta, Age 14**, Pune",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="18" x2="23" y2="23"/><line x1="20" y1="21" x2="26" y2="21"/></svg> },
  { type:"ai", time:"10:08 AM", text:"Match confirmed by officer: **Case #2341**, family notified",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
];

/* ── Alerts data ────────────────────────────────────────────── */
const INIT_ALERTS = [
  { id:"ALT-001", type:"match",    icon:"🤖", title:"High-Priority Match Detected",   desc:"Anya Sharma (MP-2891) matched with 94% confidence on Bangalore MG Road Cam #07.", time:"2 min ago",  read:false },
  { id:"ALT-002", type:"sighting", icon:"👁",  title:"Duplicate Sighting Reported",    desc:"3 citizen sightings near Central Station, Mumbai match case MP-2876 (Vikram Singh).", time:"18 min ago", read:false },
  { id:"ALT-003", type:"system",   icon:"⚙️",  title:"Case Approaching 72-Hour Mark",  desc:"Case MP-2863 has been open for 69 hours without a confirmed match.", time:"45 min ago", read:false },
  { id:"ALT-004", type:"sighting", icon:"👁",  title:"New Sighting: Priya Mehta",      desc:"Citizen reported sighting in Pune, Camp area. Forwarded to assigned officer.", time:"1 hr ago",   read:true  },
  { id:"ALT-005", type:"match",    icon:"🤖", title:"Match Confirmed: Rajan Iyer",     desc:"MP-2840 resolved. Individual located safely in Chennai T. Nagar.", time:"4 hrs ago",  read:true  },
  { id:"ALT-006", type:"system",   icon:"⚙️",  title:"CCTV Feed Disconnected",         desc:"Camera #MUM-12 at Mumbai CST has gone offline. Contact technical team.", time:"5 hrs ago",  read:true  },
];

const ALERT_TYPE = {
  match:    { label:"AI Match",  cls:"badge-blue"  },
  sighting: { label:"Sighting",  cls:"badge-green" },
  system:   { label:"System",    cls:"badge-amber" },
};

function renderBold(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
}

/* ── Activity tab ───────────────────────────────────────────── */
function ActivityTab() {
  return (
    <div className="activity-list timeline">
      {ACTIVITIES.map((a, i) => (
        <div key={i} className="activity-item">
          <div className={`activity-icon ${a.type}`}>{a.icon}</div>
          <div className="activity-body">
            <div className="activity-time">{a.time}</div>
            <div className="activity-text">{renderBold(a.text)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Alerts tab ─────────────────────────────────────────────── */
function AlertsTab() {
  const { can } = useRole();
  const [alerts, setAlerts] = useState(INIT_ALERTS);

  const visible = alerts.filter(a => {
    if (a.type === "match"    && !can("alerts_see_matches"))   return false;
    if (a.type === "system"   && !can("alerts_see_system"))    return false;
    if (a.type === "sighting" && !can("alerts_see_sightings")) return false;
    return true;
  });

  const markRead    = id => setAlerts(a => a.map(x => x.id === id ? { ...x, read:true } : x));
  const dismiss     = id => setAlerts(a => a.filter(x => x.id !== id));

  if (!visible.length) return (
    <div className="empty-state"><div className="empty-icon">🎉</div><div className="empty-text">No alerts right now</div></div>
  );

  return (
    <div className="activity-list">
      {visible.map(a => {
        const cfg = ALERT_TYPE[a.type];
        return (
          <div key={a.id} className={`activity-item alert-item ${a.read ? "read" : "unread"}`}>
            <div className="activity-icon alert">{a.icon}</div>
            <div className="activity-body">
              <div className="alert-title-row">
                <span className="alert-title">{a.title}</span>
                <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
              </div>
              <div className="alert-desc">{a.desc}</div>
              <div className="activity-time">{a.time}</div>
            </div>
            <div className="alert-actions">
              {!a.read && <button className="alert-btn" onClick={() => markRead(a.id)}>Mark Read</button>}
              <button className="alert-btn dismiss btn-danger-ghost" onClick={() => dismiss(a.id)}>✕</button>
            </div>
            {!a.read && <div className="unread-dot" />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────── */
export default function LiveFeed() {
  const { can } = useRole();
  const [tab, setTab] = useState("activity");
  const [alerts, setAlerts] = useState(INIT_ALERTS);

  const unread = alerts.filter(a => !a.read).length;
  const markAll = () => setAlerts(a => a.map(x => ({ ...x, read:true })));

  return (
    <div className="feed-card card">
      <div className="card-header">
        <div className="filter-tabs" style={{ background:"transparent", border:"none", padding:0 }}>
          <button className={`tab-btn${tab==="activity"?" active":""}`} onClick={() => setTab("activity")}>
            Activity
          </button>
          <button className={`tab-btn${tab==="alerts"?" active":""}`} onClick={() => setTab("alerts")}>
            Alerts {unread > 0 && <span className="badge badge-count">{unread}</span>}
          </button>
        </div>

        {tab === "activity"
          ? <span className="badge badge-live">LIVE</span>
          : unread > 0 && <button className="btn-ghost" style={{ padding:"4px 10px", fontSize:11 }} onClick={markAll}>Mark All Read</button>
        }
      </div>

      {tab === "activity" ? <ActivityTab /> : <AlertsTab />}
    </div>
  );
}
