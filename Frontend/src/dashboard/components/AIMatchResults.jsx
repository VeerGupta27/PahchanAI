import { useState } from "react";
import "./AIMatchResults.css";

const MATCHES = [
  { id: "MR-4421", caseId: "MP-2876", name: "Vikram Singh",   score: 89, cam: "Delhi, CCTV Cam #45A",        time: "10:38 AM", date: "Today",     status: "pending",   initials: "VS", photoUrl: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "MR-4420", caseId: "MP-2863", name: "Jarmet Shanaan", score: 76, cam: "Mumbai, Station Cam #12",     time: "09:14 AM", date: "Today",     status: "pending",   initials: "JS", photoUrl: "https://randomuser.me/api/portraits/men/56.jpg" },
  { id: "MR-4418", caseId: "MP-2891", name: "Anya Sharma",    score: 94, cam: "Bangalore, MG Road Cam #07",  time: "08:55 AM", date: "Today",     status: "confirmed", initials: "AS", photoUrl: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "MR-4415", caseId: "MP-2851", name: "Priya Mehta",    score: 61, cam: "Pune, Koregaon Cam #03",      time: "07:30 PM", date: "Yesterday", status: "discarded", initials: "PM", photoUrl: "https://randomuser.me/api/portraits/women/62.jpg" },
  { id: "MR-4412", caseId: "MP-2835", name: "Sunita Devi",    score: 83, cam: "Kolkata, Park St Cam #09",    time: "04:12 PM", date: "Yesterday", status: "confirmed", initials: "SD", photoUrl: "https://randomuser.me/api/portraits/women/29.jpg" },
  { id: "MR-4409", caseId: "MP-2821", name: "Arjun Nair",     score: 71, cam: "Kochi, MG Road Cam #14",      time: "01:50 PM", date: "Yesterday", status: "pending",   initials: "AN", photoUrl: "https://randomuser.me/api/portraits/men/15.jpg" },
];

const STATUS_CONFIG = {
  pending:   { label: "Pending Review",  color: "amber"  },
  confirmed: { label: "Confirmed",       color: "green"  },
  discarded: { label: "Discarded",       color: "red"    },
};

export default function AIMatchResults() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? MATCHES : MATCHES.filter(m => m.status === filter);

  return (
    <div className="ai-results-page">
      <div className="ai-results-header">
        <div>
          <h2 className="ai-results-title">AI Match Results</h2>
          <p className="ai-results-sub">Review AI-generated face matches from CCTV detections</p>
        </div>
        <div className="ai-results-summary">
          <div className="ai-summary-stat"><span>{MATCHES.filter(m=>m.status==="pending").length}</span>Pending</div>
          <div className="ai-summary-stat green"><span>{MATCHES.filter(m=>m.status==="confirmed").length}</span>Confirmed</div>
          <div className="ai-summary-stat red"><span>{MATCHES.filter(m=>m.status==="discarded").length}</span>Discarded</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="ai-filter-tabs">
        {["all","pending","confirmed","discarded"].map(f => (
          <button key={f} className={`ai-tab${filter===f?" active":""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
            <span className="ai-tab-count">{f==="all"?MATCHES.length:MATCHES.filter(m=>m.status===f).length}</span>
          </button>
        ))}
      </div>

      {/* Match cards */}
      <div className="ai-matches-grid">
        {filtered.map((m) => {
          const cfg = STATUS_CONFIG[m.status];
          return (
            <div key={m.id} className={`ai-match-card card ${m.status}`}>
              <div className="ai-match-card-header">
                <span className="ai-match-id">{m.id}</span>
                <span className={`ai-match-status ${cfg.color}`}>{cfg.label}</span>
              </div>

              <div className="ai-match-photos">
                <div className="ai-match-photo-col">
                  <div className="ai-photo-label">Missing Person</div>
                  <img src={m.photoUrl} alt={m.name} className="ai-photo source"
                    onError={(e)=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}} />
                  <div className="ai-photo-fallback source" style={{display:"none"}}>{m.initials}</div>
                  <div className="ai-photo-name">{m.name}</div>
                  <div className="ai-photo-case">{m.caseId}</div>
                </div>

                <div className="ai-match-arrow-col">
                  <div className="ai-score-circle" style={{ "--score": m.score }}>
                    <svg viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                      <circle cx="30" cy="30" r="26" fill="none"
                        stroke={m.score>=80?"#3b82f6":m.score>=65?"#f59e0b":"#ef4444"}
                        strokeWidth="5"
                        strokeDasharray={`${(m.score/100)*163} 163`}
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                      />
                    </svg>
                    <span className="ai-score-val">{m.score}%</span>
                  </div>
                  <div className="ai-score-label">similarity</div>
                </div>

                <div className="ai-match-photo-col">
                  <div className="ai-photo-label">CCTV Detection</div>
                  <div className="ai-photo-fallback detected">{m.initials}</div>
                  <div className="ai-photo-name" style={{color:"var(--text-muted)"}}>Unidentified</div>
                  <div className="ai-photo-case">{m.cam.split(",")[0]}</div>
                </div>
              </div>

              <div className="ai-match-meta">
                <div className="ai-meta-item">
                  <span>Camera</span><span>{m.cam}</span>
                </div>
                <div className="ai-meta-item">
                  <span>Detected</span><span>{m.date} · {m.time}</span>
                </div>
              </div>

              {m.status === "pending" && (
                <div className="ai-match-actions">
                  <button className="btn-confirm-sm">✓ Confirm</button>
                  <button className="btn-discard-sm">✗ Discard</button>
                  <button className="btn-view-sm">View Details</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
