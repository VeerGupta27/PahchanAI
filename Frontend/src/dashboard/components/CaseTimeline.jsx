import "./CaseTimeline.css";

const CASES = [
  {
    id: "MP-2891", name: "Anya Sharma", age: 16,
    events: [
      { type: "opened",    label: "Case Opened",             detail: "Filed by guardian. Last seen Bangalore, MG Road.",   time: "Mar 10, 2025 · 09:00 AM" },
      { type: "sighting",  label: "Citizen Sighting",         detail: "Spotted near Forum Mall by a passerby.",             time: "Mar 10, 2025 · 02:30 PM" },
      { type: "ai",        label: "AI Match Detected",        detail: "94% match on MG Road CCTV Cam #07.",                 time: "Mar 12, 2025 · 08:55 AM" },
      { type: "confirmed", label: "Match Confirmed",          detail: "Sr. Officer Arjun Kumar confirmed the match.",       time: "Mar 12, 2025 · 09:20 AM" },
    ]
  },
  {
    id: "MP-2876", name: "Vikram Singh", age: 35,
    events: [
      { type: "opened",   label: "Case Opened",              detail: "Filed by family. Last seen Mumbai, Juhu Beach.",     time: "Mar 08, 2025 · 11:00 AM" },
      { type: "ai",       label: "AI Match Detected",        detail: "89% match on Delhi CCTV Cam #45A.",                  time: "Mar 12, 2025 · 10:38 AM" },
      { type: "pending",  label: "Pending Officer Review",   detail: "Awaiting confirmation from assigned officer.",       time: "Mar 12, 2025 · 10:40 AM" },
    ]
  },
  {
    id: "MP-2840", name: "Rajan Iyer", age: 52,
    events: [
      { type: "opened",   label: "Case Opened",              detail: "Filed by spouse. Last seen Chennai, T. Nagar.",     time: "Feb 26, 2025 · 03:00 PM" },
      { type: "sighting", label: "Multiple Sightings",        detail: "3 citizen reports near Anna Salai, Chennai.",       time: "Feb 27, 2025 · 10:00 AM" },
      { type: "ai",       label: "AI Match Detected",        detail: "91% match on Anna Salai CCTV Cam #03.",             time: "Feb 28, 2025 · 08:00 AM" },
      { type: "confirmed",label: "Match Confirmed",          detail: "Officer confirmed. Family contacted.",              time: "Feb 28, 2025 · 09:30 AM" },
      { type: "resolved", label: "Case Resolved",            detail: "Individual located safely. Case closed.",           time: "Feb 28, 2025 · 11:00 AM" },
    ]
  },
];

const EVENT_CONFIG = {
  opened:    { color: "#3b82f6", label: "Opened"    },
  sighting:  { color: "#22d3ee", label: "Sighting"  },
  ai:        { color: "#f97316", label: "AI Match"  },
  confirmed: { color: "#a78bfa", label: "Confirmed" },
  pending:   { color: "#f59e0b", label: "Pending"   },
  resolved:  { color: "#22c55e", label: "Resolved"  },
};

export default function CaseTimeline() {
  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h2 className="timeline-title">Case Timeline</h2>
        <p className="timeline-sub">Chronological view of all case events and updates</p>
      </div>

      <div className="timeline-cases">
        {CASES.map((c) => (
          <div key={c.id} className="timeline-case card">
            <div className="card-header">
              <div className="timeline-case-info">
                <span className="timeline-case-name">{c.name}</span>
                <span className="timeline-case-id">{c.id} · Age {c.age}</span>
              </div>
              <span className={`timeline-case-status ${c.events[c.events.length-1].type}`}>
                {EVENT_CONFIG[c.events[c.events.length-1].type].label}
              </span>
            </div>

            <div className="timeline-events">
              {c.events.map((e, i) => {
                const cfg = EVENT_CONFIG[e.type];
                return (
                  <div key={i} className="timeline-event">
                    <div className="timeline-spine">
                      <div className="timeline-dot" style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}66` }} />
                      {i < c.events.length - 1 && <div className="timeline-line" />}
                    </div>
                    <div className="timeline-event-body">
                      <div className="timeline-event-top">
                        <span className="timeline-event-label">{e.label}</span>
                        <span className="timeline-event-time">{e.time}</span>
                      </div>
                      <div className="timeline-event-detail">{e.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
