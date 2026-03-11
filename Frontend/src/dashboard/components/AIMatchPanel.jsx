import { useState } from "react";
import "./AIMatchPanel.css";
import { useRole } from "../context/RoleContext";

export default function AIMatchPanel() {
  const { can } = useRole();
  const canAct = can("action_confirm_match");
  const [confirmed, setConfirmed] = useState(false);
  const [discarded, setDiscarded] = useState(false);

  if (discarded) {
    return (
      <div className="ai-match-panel card">
        <div className="card-header"><span className="card-title">AI Match Panel</span></div>
        <div className="ai-match-body" style={{alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          <div style={{fontSize:32}}>🔍</div>
          <div style={{color:"var(--text-muted)",fontSize:13,marginTop:8}}>No pending matches</div>
          {canAct && <button className="btn-confirm" style={{marginTop:16,width:"100%"}} onClick={() => setDiscarded(false)}>Reload Queue</button>}
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="ai-match-panel card">
        <div className="card-header"><span className="card-title">AI Match Panel</span></div>
        <div className="ai-match-body" style={{alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>✅</div>
          <div style={{color:"var(--green)",fontWeight:700,fontSize:14}}>Match Confirmed!</div>
          <div style={{color:"var(--text-muted)",fontSize:12,marginTop:4}}>Family notification sent. Case updated.</div>
          <button className="btn-confirm" style={{marginTop:16,width:"100%"}} onClick={() => setConfirmed(false)}>Next Match</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-match-panel card">
      <div className="card-header">
        <span className="card-title">AI Match Panel</span>
        <span style={{fontSize:9,color:"var(--amber)",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.25)",padding:"2px 7px",borderRadius:"999px",fontWeight:700,letterSpacing:"0.06em"}}>
          PENDING REVIEW
        </span>
      </div>

      <div className="ai-match-body">
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,fontSize:9,color:"var(--text-muted)",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",textAlign:"center"}}>
          <span>Missing Person (Photo)</span>
          <span style={{visibility:"hidden"}}>→</span>
          <span>AI Detection (CCTV Frame)</span>
        </div>

        <div className="match-comparison">
          <div className="match-photo-wrap">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Missing person" className="match-photo source"
              onError={(e) => { e.target.style.display="none"; }}/>
          </div>
          <div className="match-arrow">
            <div className="match-arrow-dots">
              <div className="match-arrow-dot"/><div className="match-arrow-dot"/><div className="match-arrow-dot"/>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
          <div className="match-photo-wrap">
            <div className="match-photo-placeholder detected">AS</div>
          </div>
        </div>

        <div className="match-score">
          <div className="match-score-value">89%</div>
          <div className="match-score-label">Similarity Score</div>
          <div className="match-confidence-bar-wrap">
            <div className="match-confidence-bar" style={{width:"89%"}}/>
          </div>
        </div>

        <div className="match-meta">
          <div className="match-meta-row"><span className="match-meta-key">Confidence</span><span className="match-meta-val positive">High</span></div>
          <div className="match-meta-row"><span className="match-meta-key">Detected at</span><span className="match-meta-val">10:38 AM</span></div>
          <div className="match-meta-row"><span className="match-meta-key">Location</span><span className="match-meta-val">Delhi, CCTV #45A</span></div>
          <div className="match-meta-row"><span className="match-meta-key">Case ID</span><span className="match-meta-val">MP-2891</span></div>
        </div>

        {/* Officers see confirm/discard — partners see read-only notice */}
        {canAct ? (
          <div className="match-actions">
            <button className="btn-confirm" onClick={() => setConfirmed(true)}>Confirm Match</button>
            <button className="btn-discard" onClick={() => setDiscarded(true)}>Discard</button>
          </div>
        ) : (
          <div className="match-readonly-notice">
            🔒 Only Police Officers can confirm or discard matches
          </div>
        )}
      </div>
    </div>
  );
}
