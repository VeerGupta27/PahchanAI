import "./ActivityFeed.css";

const ACTIVITIES = [
  {
    type: "citizen",
    time: "10:45 AM",
    text: "Citizen sighting reported: **Mumbai, Near Central Station**",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      </svg>
    ),
  },
  {
    type: "ai",
    time: "10:38 AM",
    text: "AI match detected: **Delhi, CCTV Cam #45A**, 87% similarity",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <circle cx="11" cy="11" r="3" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    type: "review",
    time: "10:30 AM",
    text: "Authority reviewing report: **Case #2349, Bangalore**",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="9" y1="11" x2="15" y2="11" />
      </svg>
    ),
  },
  {
    type: "citizen",
    time: "10:21 AM",
    text: "New case registered: **Priya Mehta, Age 14**, Pune",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="23" y1="18" x2="23" y2="23" />
        <line x1="20" y1="21" x2="26" y2="21" />
      </svg>
    ),
  },
  {
    type: "ai",
    time: "10:08 AM",
    text: "Match confirmed by officer: **Case #2341**, family notified",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

function renderText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export default function ActivityFeed() {
  return (
    <div className="activity-feed card">
      <div className="card-header">
        <span className="card-title">Activity Feed</span>
        <span style={{ fontSize: 10, color: "var(--blue-bright)", background: "var(--blue-dim)", padding: "2px 8px", borderRadius: "999px", fontWeight: 600, letterSpacing: "0.06em" }}>
          LIVE
        </span>
      </div>
      <div className="activity-list activity-timeline">
        {ACTIVITIES.map((a, i) => (
          <div key={i} className="activity-item">
            <div className={`activity-icon-wrap ${a.type}`}>{a.icon}</div>
            <div className="activity-body">
              <div className="activity-time">{a.time}</div>
              <div className="activity-text">{renderText(a.text)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}