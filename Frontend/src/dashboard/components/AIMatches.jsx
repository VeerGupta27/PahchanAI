/**
 * AIMatches.jsx
 * Merges: AIMatchPanel + AIMatchResults
 *
 * Usage:
 *   <AIMatches />              — shows full results page
 *   <AIMatches panel />        — compact sidebar panel mode (single pending match)
 */

import { useState } from "react";
import "./dashboard.css";
import { useRole } from "../context/RoleContext";

/* ── Data ───────────────────────────────────────────────────── */
const MATCHES = [
  { id:"MR-4421", caseId:"MP-2876", name:"Vikram Singh",   score:89, cam:"Delhi, CCTV Cam #45A",       time:"10:38 AM", date:"Today",     status:"pending",   initials:"VS", photo:"https://randomuser.me/api/portraits/men/32.jpg" },
  { id:"MR-4420", caseId:"MP-2863", name:"Jarmet Shanaan", score:76, cam:"Mumbai, Station Cam #12",    time:"09:14 AM", date:"Today",     status:"pending",   initials:"JS", photo:"https://randomuser.me/api/portraits/men/56.jpg" },
  { id:"MR-4418", caseId:"MP-2891", name:"Anya Sharma",    score:94, cam:"Bangalore, MG Road Cam #07", time:"08:55 AM", date:"Today",     status:"confirmed", initials:"AS", photo:"https://randomuser.me/api/portraits/women/44.jpg" },
  { id:"MR-4415", caseId:"MP-2851", name:"Priya Mehta",    score:61, cam:"Pune, Koregaon Cam #03",     time:"07:30 PM", date:"Yesterday", status:"discarded", initials:"PM", photo:"https://randomuser.me/api/portraits/women/62.jpg" },
  { id:"MR-4412", caseId:"MP-2835", name:"Sunita Devi",    score:83, cam:"Kolkata, Park St Cam #09",   time:"04:12 PM", date:"Yesterday", status:"confirmed", initials:"SD", photo:"https://randomuser.me/api/portraits/women/29.jpg" },
  { id:"MR-4409", caseId:"MP-2821", name:"Arjun Nair",     score:71, cam:"Kochi, MG Road Cam #14",     time:"01:50 PM", date:"Yesterday", status:"pending",   initials:"AN", photo:"https://randomuser.me/api/portraits/men/15.jpg" },
];

const STATUS_CFG = {
  pending:   { label:"Pending Review", cls:"badge-amber" },
  confirmed: { label:"Confirmed",      cls:"badge-green" },
  discarded: { label:"Discarded",      cls:"badge-red"   },
};

/* ── Score circle ───────────────────────────────────────────── */
function ScoreCircle({ score }) {
  const color = score >= 80 ? "#3b82f6" : score >= 65 ? "#f59e0b" : "#ef4444";
  return (
    <div className="score-circle">
      <svg viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
        <circle cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(score / 100) * 163} 163`}
          strokeLinecap="round" transform="rotate(-90 30 30)" />
      </svg>
      <span className="score-val">{score}%</span>
    </div>
  );
}

/* ── Photo cell ─────────────────────────────────────────────── */
function MatchPhoto({ photo, initials, label, side, name, sub }) {
  const [err, setErr] = useState(false);
  return (
    <div className="match-photo-col">
      <div className="match-photo-lbl">{label}</div>
      {!err && photo
        ? <img src={photo} alt={name} className={`match-thumb ${side}`} onError={() => setErr(true)} />
        : <div className={`match-fallback ${side}`}>{initials}</div>}
      <div className="match-photo-name">{name}</div>
      {sub && <div className="match-photo-sub">{sub}</div>}
    </div>
  );
}

/* ── Single match card ──────────────────────────────────────── */
function MatchCard({ match, onUpdate }) {
  const { can } = useRole();
  const canAct = can("action_confirm_match");
  const cfg = STATUS_CFG[match.status];

  return (
    <div className="match-card card">
      <div className="match-card-header">
        <span className="match-card-id">{match.id}</span>
        <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
      </div>

      <div className="match-photos">
        <MatchPhoto photo={match.photo} initials={match.initials} label="Missing Person"
          side="src" name={match.name} sub={match.caseId} />

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <ScoreCircle score={match.score} />
          <div className="score-lbl">similarity</div>
        </div>

        <MatchPhoto photo={null} initials={match.initials} label="CCTV Detection"
          side="detected" name="Unidentified" sub={match.cam.split(",")[0]} />
      </div>

      <div className="match-meta-strip">
        <div className="meta-row"><span className="meta-key">Camera</span><span className="meta-val">{match.cam}</span></div>
        <div className="meta-row"><span className="meta-key">Detected</span><span className="meta-val">{match.date} · {match.time}</span></div>
      </div>

      {match.status === "pending" && canAct && (
        <div className="match-actions">
          <button className="btn-confirm-sm" onClick={() => onUpdate(match.id, "confirmed")}>✓ Confirm</button>
          <button className="btn-discard-sm" onClick={() => onUpdate(match.id, "discarded")}>✗ Discard</button>
          <button className="btn-view-sm">View Details</button>
        </div>
      )}
    </div>
  );
}

/* ── Panel mode (compact sidebar) ───────────────────────────── */
function PanelMode({ matches, onUpdate }) {
  const { can } = useRole();
  const canAct = can("action_confirm_match");
  const pending = matches.filter(m => m.status === "pending");
  const m = pending[0];

  if (!m) return (
    <div className="card" style={{ display:"flex", flexDirection:"column" }}>
      <div className="card-header"><span className="card-title">AI Match Panel</span></div>
      <div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-text">No pending matches</div></div>
    </div>
  );

  return (
    <div className="card" style={{ display:"flex", flexDirection:"column" }}>
      <div className="card-header">
        <span className="card-title">AI Match Panel</span>
        <span className="badge badge-amber">PENDING REVIEW</span>
      </div>
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:10, fontSize:9, color:"var(--text-muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", textAlign:"center" }}>
          <span>Missing Person</span><span style={{visibility:"hidden"}}>·</span><span>CCTV Detection</span>
        </div>

        <div className="match-photos" style={{ padding:0 }}>
          <MatchPhoto photo={m.photo} initials={m.initials} label="" side="src" name={m.name} />
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <ScoreCircle score={m.score} /><div className="score-lbl">similarity</div>
          </div>
          <MatchPhoto photo={null} initials={m.initials} label="" side="detected" name="Unidentified" />
        </div>

        {/* Big score */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:38, fontWeight:800, color:"var(--blue-bright)", lineHeight:1, letterSpacing:"-0.03em" }}>{m.score}%</div>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>Similarity Score</div>
          <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:999, height:5, overflow:"hidden", marginTop:8 }}>
            <div style={{ height:"100%", width:`${m.score}%`, borderRadius:999, background:"linear-gradient(90deg,var(--blue),var(--cyan))", boxShadow:"0 0 8px rgba(59,130,246,0.5)", transition:"width 1s ease" }} />
          </div>
        </div>

        <div className="match-meta-strip" style={{ borderTop:"none", background:"rgba(255,255,255,0.025)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"10px 12px" }}>
          <div className="meta-row"><span className="meta-key">Confidence</span><span className="meta-val positive">High</span></div>
          <div className="meta-row"><span className="meta-key">Detected</span><span className="meta-val">{m.time}</span></div>
          <div className="meta-row"><span className="meta-key">Location</span><span className="meta-val">{m.cam}</span></div>
          <div className="meta-row"><span className="meta-key">Case ID</span><span className="meta-val">{m.caseId}</span></div>
        </div>

        {canAct ? (
          <div className="match-actions" style={{ padding:0, border:"none" }}>
            <button className="btn-confirm-sm" onClick={() => onUpdate(m.id, "confirmed")}>Confirm Match</button>
            <button className="btn-discard-sm" onClick={() => onUpdate(m.id, "discarded")}>Discard</button>
          </div>
        ) : (
          <div style={{ textAlign:"center", fontSize:11, color:"var(--text-dim)", background:"rgba(255,255,255,0.02)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"10px 14px", lineHeight:1.5 }}>
            🔒 Only Police Officers can confirm or discard matches
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────── */
export default function AIMatches({ panel = false }) {
  const [matches, setMatches] = useState(MATCHES);
  const [filter, setFilter]   = useState("all");

  const update = (id, status) =>
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));

  if (panel) return <PanelMode matches={matches} onUpdate={update} />;

  const filtered = filter === "all" ? matches : matches.filter(m => m.status === filter);
  const counts = { pending: matches.filter(m=>m.status==="pending").length, confirmed: matches.filter(m=>m.status==="confirmed").length, discarded: matches.filter(m=>m.status==="discarded").length };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">AI Match Results</h2>
          <p className="page-sub">Review AI-generated face matches from CCTV detections</p>
        </div>
        <div className="ai-summary-row">
          <div className="ai-stat"><span className="ai-stat-val amber">{counts.pending}</span>Pending</div>
          <div className="ai-stat"><span className="ai-stat-val green">{counts.confirmed}</span>Confirmed</div>
          <div className="ai-stat"><span className="ai-stat-val red">{counts.discarded}</span>Discarded</div>
        </div>
      </div>

      <div className="filter-tabs">
        {["all","pending","confirmed","discarded"].map(f => (
          <button key={f} className={`tab-btn${filter===f?" active":""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
            <span className="tab-count">{f==="all" ? matches.length : counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="matches-grid">
        {filtered.map(m => <MatchCard key={m.id} match={m} onUpdate={update} />)}
      </div>
    </div>
  );
}
