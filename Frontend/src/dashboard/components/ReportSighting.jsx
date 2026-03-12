/**
 * ReportSighting.jsx — updated to use dashboard.css
 * Drop-in replacement for the original.
 */
import { useState } from "react";
import "./dashboard.css";

const TIPS = [
  ["Be Specific",         "Include street names, store names, or landmarks near the sighting."],
  ["Time Matters",        "Even an approximate time range helps narrow down CCTV footage."],
  ["Physical Details",    "Note clothing color, height, and any distinguishing marks."],
  ["Stay Safe",           "Do not approach the person. Alert authorities and report here."],
  ["Multiple Sightings",  "If seen multiple times, submit separate reports for each."],
];

export default function ReportSighting() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name:"", age:"", gender:"", location:"", landmark:"",
    date:"", time:"", description:"", contact:"",
  });

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  if (submitted) {
    return (
      <div className="page">
        <div className="success-state card">
          <div className="success-icon">✅</div>
          <h3 className="page-title" style={{ color:"var(--green)", fontFamily:"'Sora',sans-serif" }}>Sighting Reported Successfully</h3>
          <p className="page-sub" style={{ maxWidth:400, lineHeight:1.6 }}>
            Your report has been submitted and forwarded to the nearest officer.
            Reference ID: <strong>#SG-{Math.floor(Math.random()*90000+10000)}</strong>
          </p>
          <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name:"",age:"",gender:"",location:"",landmark:"",date:"",time:"",description:"",contact:"" }); }}>
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Report a Sighting</h2>
          <p className="page-sub">Provide accurate details to help us locate missing individuals faster</p>
        </div>
        <div className="urgency-badge">🚨 Reports are reviewed within 15 minutes</div>
      </div>

      <div className="sighting-layout">
        {/* Form */}
        <div className="card">
          <div className="card-header"><span className="card-title">Sighting Details</span></div>
          <div className="register-panel">

            <div className="section-label">Person Sighted</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name (if known)</label>
                <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="e.g. Anya Sharma or Unknown" />
              </div>
              <div className="form-group">
                <label className="form-label">Approximate Age</label>
                <input className="form-input" name="age" value={form.age} onChange={handle} placeholder="e.g. 16" type="number" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <div className="form-radio-group">
                {["Male","Female","Unknown"].map(g => (
                  <label key={g} className={`form-radio${form.gender===g?" active":""}`}>
                    <input type="radio" name="gender" value={g} checked={form.gender===g} onChange={handle} />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            <div className="section-label">Location & Time</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location Seen *</label>
                <input className="form-input" name="location" value={form.location} onChange={handle} placeholder="City, Area, Street" />
              </div>
              <div className="form-group">
                <label className="form-label">Nearby Landmark</label>
                <input className="form-input" name="landmark" value={form.landmark} onChange={handle} placeholder="e.g. Near Central Station" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date Seen *</label>
                <input className="form-input" name="date" value={form.date} onChange={handle} type="date" />
              </div>
              <div className="form-group">
                <label className="form-label">Time (approx)</label>
                <input className="form-input" name="time" value={form.time} onChange={handle} type="time" />
              </div>
            </div>

            <div className="section-label">Additional Info</div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" name="description" value={form.description} onChange={handle} rows={3} placeholder="Clothing, physical description, direction of movement…" />
            </div>
            <div className="form-group">
              <label className="form-label">Your Contact Number</label>
              <input className="form-input" name="contact" value={form.contact} onChange={handle} placeholder="+91 XXXXX XXXXX" />
            </div>

            <button className="btn-primary" onClick={() => { if (form.location) setSubmitted(true); }}>
              Submit Sighting Report →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">📋 Reporting Tips</span></div>
            <div className="tips-body">
              {TIPS.map(([title, desc]) => (
                <div key={title} className="tip-item">
                  <div className="tip-title">{title}</div>
                  <div className="tip-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hotline-box card">
            <div className="hotline-label">📞 Emergency Helpline</div>
            <div className="hotline-number">1098</div>
            <div className="hotline-sub">Child helpline · Available 24/7</div>
          </div>
        </div>
      </div>
    </div>
  );
}
