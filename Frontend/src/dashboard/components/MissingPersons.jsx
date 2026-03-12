/**
 * MissingPersons.jsx
 * Merges: MissingPersonsExplorer (card grid + register form) + MissingPersonsTable
 *
 * Three views toggled by top bar:
 *   - "cards"    → responsive card grid (explorer style)
 *   - "table"    → compact data table
 *   - "register" → add new missing person form (canEdit only)
 */

import { useState, useEffect } from "react";
import "./dashboard.css";
import { useRole } from "../context/RoleContext";

const BASE = "https://pahchanai.onrender.com";

/* ── Icons ──────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const GridIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
);
const TableIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h18M3 6h18M3 14h18M3 18h18"/></svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

/* ── Photo cell helper ──────────────────────────────────────── */
function PersonPhoto({ src, name, className, style }) {
  const [err, setErr] = useState(false);
  const initials = name?.slice(0, 2).toUpperCase() || "??";
  if (!err && src) return <img src={`${BASE}/${src}`} alt={name} className={className} style={style} onError={() => setErr(true)} />;
  return <div className={`avatar-placeholder ${className}`} style={style}>{initials}</div>;
}

/* ── Card view ──────────────────────────────────────────────── */
function CardsView({ persons, canEdit }) {
  return (
    <div className="persons-grid">
      {persons.map(p => (
        <div key={p._id} className="person-card">
          <div className="person-card-top">
            <PersonPhoto src={p.image} name={p.name}
              className="person-thumb" style={{ fontSize:16 }} />
            <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:4 }}>
              <div className="person-name-lbl">{p.name}</div>
              <div className="person-id-lbl">{p._id?.slice(-8).toUpperCase()}</div>
            </div>
          </div>

          <div className="person-meta">
            <div className="meta-row">
              <span className="meta-key">Location</span>
              <span style={{ color:"var(--text-secondary)", fontSize:11 }}>{p.location || "—"}</span>
            </div>
            <div className="meta-row">
              <span className="meta-key">Reported</span>
              <span style={{ color:"var(--text-secondary)", fontSize:11 }}>
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="person-card-actions">
              <button className="btn-view-outline">View</button>
              <button className="btn-update-filled">Update</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Table view ─────────────────────────────────────────────── */
function TableView({ persons, canEdit }) {
  return (
    <div className="persons-table-wrap">
      <table className="persons-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Location</th>
            <th>Reported</th>
            {canEdit && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {persons.map(p => (
            <tr key={p._id}>
              <td>
                <PersonPhoto src={p.image} name={p.name}
                  className="avatar row-avatar"
                  style={{ width:34, height:34, fontSize:12 }} />
              </td>
              <td className="td-name">{p.name}</td>
              <td>{p.location || "—"}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              {canEdit && (
                <td>
                  <div style={{ display:"flex", gap:6 }}>
                    <button className="btn-view-outline" style={{ padding:"5px 12px", borderRadius:6, fontSize:11 }}>View</button>
                    <button className="btn-update-filled" style={{ padding:"5px 12px", borderRadius:6, fontSize:11 }}>Update</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Register form ──────────────────────────────────────────── */
function RegisterForm({ onSuccess }) {
  const [form, setForm]     = useState({ name:"", location:"", email:"" });
  const [image, setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState(null); // { ok, text }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!image) return setMsg({ ok:false, text:"Please upload a photo." });
    setLoading(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("location", form.location);
      fd.append("email", form.email);
      fd.append("image", image);
      const res  = await fetch(`${BASE}/ai/add-suspect`, { method:"POST", body:fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMsg({ ok:true, text:"Person registered successfully." });
      setForm({ name:"", location:"", email:"" });
      setImage(null); setPreview(null);
      onSuccess?.();
    } catch (err) {
      setMsg({ ok:false, text: err.message });
    } finally { setLoading(false); }
  };

  return (
    <form className="register-panel" onSubmit={handleSubmit}>
      <div className="section-label">Person Details</div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ananya Sharma" required />
        </div>
        <div className="form-group">
          <label className="form-label">Last Seen Location</label>
          <input className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="City, Area" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Reporter Email *</label>
        <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="reporter@example.com" required />
      </div>

      <div className="section-label">Photo</div>

      {preview ? (
        <div className="upload-zone" style={{ flexDirection:"row", gap:14, justifyContent:"flex-start" }}>
          <img src={preview} alt="preview" style={{ width:64, height:64, borderRadius:"var(--radius-sm)", objectFit:"cover", border:"1.5px solid var(--border-accent)", flexShrink:0 }} />
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{image?.name}</div>
            <div style={{ fontSize:11, color:"var(--text-muted)" }}>Click below to change</div>
            <label style={{ cursor:"pointer" }}>
              <span style={{ fontSize:11, fontWeight:600, color:"#fca5a5", textDecoration:"underline" }}>Remove</span>
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => { setImage(null); setPreview(null); }} onClick={e => e.target.value=""} />
            </label>
          </div>
        </div>
      ) : (
        <label className="upload-zone">
          <div style={{ fontSize:28 }}>📷</div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text-secondary)" }}>Click to upload photo</div>
          <div style={{ fontSize:11, color:"var(--text-dim)" }}>JPG, PNG — clear face photo required</div>
          <input type="file" accept="image/*" onChange={handleImage} required />
        </label>
      )}

      {msg && <div className={msg.ok ? "register-success" : "register-error"}>{msg.ok ? "✅" : "❌"} {msg.text}</div>}

      <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
        {loading ? "Uploading…" : "Register Missing Person →"}
      </button>
    </form>
  );
}

/* ── Main export ────────────────────────────────────────────── */
export default function MissingPersons() {
  const { can } = useRole();
  const canEdit = can("explorer_can_edit");

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [view,    setView]    = useState("cards"); // "cards" | "table" | "register"

  const fetchPersons = async () => {
    try {
      const res  = await fetch(`${BASE}/ai/get-missing`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPersons(data.suspects || []);
    } catch (err) {
      console.error("Failed to fetch persons", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPersons(); }, []);

  const filtered = persons.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  const headerTitle = view === "register" ? "Register Missing Person" : "Missing Persons";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{headerTitle}</h2>
          <p className="page-sub">
            {view === "register"
              ? "Submit a new missing person to the database"
              : `${filtered.length} record${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          {/* View switcher */}
          {view !== "register" && (
            <div className="view-switcher">
              <button className={`view-btn${view==="cards"?" active":""}`} onClick={() => setView("cards")}>
                <GridIcon /> Cards
              </button>
              <button className={`view-btn${view==="table"?" active":""}`} onClick={() => setView("table")}>
                <TableIcon /> Table
              </button>
            </div>
          )}

          {/* Register / Back */}
          {canEdit && (
            view === "register"
              ? <button className="btn-ghost" onClick={() => setView("cards")}>← Back</button>
              : <button className="btn-primary" onClick={() => setView("register")}><PlusIcon /> Register</button>
          )}
        </div>
      </div>

      {/* Search — only in list views */}
      {view !== "register" && (
        <div className="explorer-filters">
          <div className="search-wrap">
            <SearchIcon />
            <input
              placeholder="Search by name or location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="card" style={{ overflow:"hidden" }}>
        {view === "register" ? (
          <RegisterForm onSuccess={() => { fetchPersons(); setView("cards"); }} />
        ) : loading ? (
          <div className="empty-state"><div className="empty-text">Loading…</div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-text">No records match your search</div>
            <button className="btn-ghost" onClick={() => setSearch("")}>Clear Search</button>
          </div>
        ) : view === "cards" ? (
          <div style={{ padding:16 }}>
            <CardsView persons={filtered} canEdit={canEdit} />
          </div>
        ) : (
          <TableView persons={filtered} canEdit={canEdit} />
        )}
      </div>
    </div>
  );
}
