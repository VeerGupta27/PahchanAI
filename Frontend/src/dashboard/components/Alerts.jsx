import { useState } from "react";
import "./Alerts.css";
import { useRole } from "../context/RoleContext";

const ALL_ALERTS = [
  { id:"ALT-001", type:"match",    icon:"🤖", title:"High-Priority Match Detected",  desc:"Anya Sharma (MP-2891) matched with 94% confidence on Bangalore MG Road Cam #07.", time:"2 min ago",  read:false },
  { id:"ALT-002", type:"sighting", icon:"👁",  title:"Duplicate Sighting Reported",   desc:"3 citizen sightings near Central Station, Mumbai match case MP-2876 (Vikram Singh).", time:"18 min ago", read:false },
  { id:"ALT-003", type:"system",   icon:"⚙️",  title:"Case Approaching 72-Hour Mark", desc:"Case MP-2863 has been open for 69 hours without a confirmed match.", time:"45 min ago", read:false },
  { id:"ALT-004", type:"sighting", icon:"👁",  title:"New Sighting: Priya Mehta",     desc:"Citizen reported sighting in Pune, Camp area. Forwarded to assigned officer.", time:"1 hr ago",   read:true  },
  { id:"ALT-005", type:"match",    icon:"🤖", title:"Match Confirmed: Rajan Iyer",    desc:"MP-2840 resolved. Individual located safely in Chennai T. Nagar.", time:"4 hrs ago",  read:true  },
  { id:"ALT-006", type:"system",   icon:"⚙️",  title:"CCTV Feed Disconnected",        desc:"Camera #MUM-12 at Mumbai CST has gone offline. Contact technical team.", time:"5 hrs ago",  read:true  },
  { id:"ALT-007", type:"sighting", icon:"👁",  title:"Sighting Verified: Vikram Singh", desc:"Field officer verified the sighting at Juhu Beach. Case updated.", time:"Yesterday",  read:true  },
];

const TYPE_CONFIG = {
  match:    { label:"AI Match",  color:"blue"  },
  sighting: { label:"Sighting",  color:"green" },
  system:   { label:"System",    color:"amber" },
};

export default function Alerts() {
  const { can } = useRole();
  const [alerts, setAlerts] = useState(ALL_ALERTS);

  // Filter alerts by what this role is allowed to see
  const visibleAlerts = alerts.filter((a) => {
    if (a.type === "match"   && !can("alerts_see_matches"))   return false;
    if (a.type === "system"  && !can("alerts_see_system"))    return false;
    if (a.type === "sighting"&& !can("alerts_see_sightings")) return false;
    return true;
  });

  const unreadCount = visibleAlerts.filter((a) => !a.read).length;

  const markAllRead = () => setAlerts((a) => a.map((x) => ({ ...x, read: true })));
  const markRead    = (id) => setAlerts((a) => a.map((x) => x.id === id ? { ...x, read: true } : x));
  const dismiss     = (id) => setAlerts((a) => a.filter((x) => x.id !== id));

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div>
          <h2 className="alerts-title">
            Alerts
            {unreadCount > 0 && <span className="alerts-unread-badge">{unreadCount}</span>}
          </h2>
          <p className="alerts-sub">
            {can("alerts_see_matches")
              ? "System notifications, match alerts, and sighting updates"
              : "Sighting reports and updates from the network"}
          </p>
        </div>
        <button className="btn-mark-all" onClick={markAllRead}>Mark All as Read</button>
      </div>

      <div className="alerts-list card">
        {visibleAlerts.length === 0 && (
          <div className="alerts-empty">
            <div style={{fontSize:36}}>🎉</div>
            <div style={{color:"var(--text-muted)",fontSize:13,marginTop:8}}>No alerts right now</div>
          </div>
        )}
        {visibleAlerts.map((a) => {
          const cfg = TYPE_CONFIG[a.type];
          return (
            <div key={a.id} className={`alert-item ${a.read ? "read" : "unread"}`}>
              <div className="alert-icon-wrap">{a.icon}</div>
              <div className="alert-body">
                <div className="alert-top">
                  <span className="alert-title-text">{a.title}</span>
                  <span className={`alert-type-badge ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="alert-desc">{a.desc}</div>
                <div className="alert-time">{a.time}</div>
              </div>
              <div className="alert-actions">
                {!a.read && <button className="alert-btn" onClick={() => markRead(a.id)}>Mark Read</button>}
                <button className="alert-btn dismiss" onClick={() => dismiss(a.id)}>✕</button>
              </div>
              {!a.read && <div className="alert-unread-dot"/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
