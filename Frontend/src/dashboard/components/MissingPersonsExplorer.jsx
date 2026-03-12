import { useState, useEffect } from "react";
import "./MissingPersonsExplorer.css";
import { useRole } from "../context/RoleContext";

const BASE = "https://pahchanai.onrender.com";

const EMPTY_FORM = {
  name: "", age: "", gender: "", location: "",
  landmark: "", lastSeenDate: "", contact: "",
  description: "", priority: "high_priority",
};

/* ─── helpers to map backend → card shape ───────────────────── */
const STATUS_MAP = {
  high_priority:    { status: "high-priority", statusLabel: "Active – High Priority" },
  ai_match_pending: { status: "ai-pending",    statusLabel: "AI Match Pending" },
  resolved:         { status: "resolved",       statusLabel: "Resolved" },
};

function toCard(doc) {
  const s = STATUS_MAP[doc.status] || STATUS_MAP.high_priority;
  return {
    id:          doc._id,
    name:        doc.name,
    age:         doc.age,
    gender:      doc.gender,
    location:    doc.last_seen,
    reported:    new Date(doc.createdAt).toLocaleDateString(),
    photoUrl:    doc.photo?.url || "",
    initials:    doc.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    status:      s.status,
    statusLabel: s.statusLabel,
  };
}

/* ─── Modal ─────────────────────────────────────────────────── */
function NewCaseModal({ onClose, onSubmit }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, photo: "Only image files allowed (JPG, PNG, WEBP)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Image must be smaller than 5MB" }));
      return;
    }

    setPhotoFile(file);
    setErrors((prev) => ({ ...prev, photo: "" }));

    // Base64 only for preview — raw file is sent to backend
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Full name is required";
    if (!form.age)             e.age      = "Age is required";
    if (!form.gender)          e.gender   = "Please select a gender";
    if (!form.location.trim()) e.location = "Last seen location is required";
    if (!form.contact.trim())  e.contact  = "Contact number is required";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Must use FormData because we're sending a file
      const formData = new FormData();
      formData.append("name",           form.name);
      formData.append("age",            form.age);
      formData.append("gender",         form.gender.toLowerCase());
      formData.append("last_seen",      form.location);
      formData.append("landmark",       form.landmark);
      formData.append("last_seen_date", form.lastSeenDate);
      formData.append("contact",        form.contact);
      formData.append("description",    form.description);
      formData.append("status",         form.priority);
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch(`${BASE}/ai/add-suspect`, {
        method: "POST",
        // ⚠️ No Content-Type header — browser sets multipart boundary automatically
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register case");

      onSubmit(toCard(data.case));
      setSubmitted(true);

    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-box">

        <div className="modal-header">
          <div>
            <div className="modal-title">Register New Case</div>
            <div className="modal-sub">Fill in all required fields to open a missing person case</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {submitted ? (
          <div className="modal-success">
            <div className="modal-success-icon">✅</div>
            <div className="modal-success-title">Case Registered Successfully</div>
            <div className="modal-success-sub">
              The case has been added to the system and assigned to available officers.
            </div>
            <button className="modal-btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <div className="modal-body">

            <div className="modal-section-label">Personal Information</div>

            {/* Photo upload */}
            <div className="modal-field">
              <label className="modal-label">Photo of Missing Person</label>
              {photoPreview ? (
                <div className="photo-preview-wrap">
                  <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                  <div className="photo-preview-info">
                    <div className="photo-preview-name">Photo uploaded</div>
                    <div className="photo-preview-hint">This will be used for AI face matching</div>
                    <button className="photo-remove-btn" onClick={handleRemovePhoto}>✕ Remove</button>
                  </div>
                </div>
              ) : (
                <label className="photo-upload-zone">
                  <input type="file" accept="image/*" className="photo-file-input" onChange={handleImageChange} />
                  <div className="photo-upload-icon">📷</div>
                  <div className="photo-upload-text">Click to upload or drag & drop</div>
                  <div className="photo-upload-hint">JPG, PNG, WEBP · Max 5MB</div>
                </label>
              )}
              {errors.photo && <span className="modal-error">{errors.photo}</span>}
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Full Name *</label>
                <input className={`modal-input${errors.name ? " input-error" : ""}`}
                  name="name" value={form.name} onChange={handleChange} placeholder="e.g. Anya Sharma" />
                {errors.name && <span className="modal-error">{errors.name}</span>}
              </div>
              <div className="modal-field">
                <label className="modal-label">Age *</label>
                <input className={`modal-input${errors.age ? " input-error" : ""}`}
                  name="age" value={form.age} onChange={handleChange} placeholder="e.g. 16" type="number" min="0" max="120" />
                {errors.age && <span className="modal-error">{errors.age}</span>}
              </div>
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Gender *</label>
                <select className={`modal-input${errors.gender ? " input-error" : ""}`}
                  name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <span className="modal-error">{errors.gender}</span>}
              </div>
              <div className="modal-field">
                <label className="modal-label">Priority Level</label>
                <select className="modal-input" name="priority" value={form.priority} onChange={handleChange}>
                  <option value="high_priority">High Priority</option>
                  <option value="ai_match_pending">Standard</option>
                </select>
              </div>
            </div>

            <div className="modal-section-label">Last Known Location</div>
            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Location *</label>
                <input className={`modal-input${errors.location ? " input-error" : ""}`}
                  name="location" value={form.location} onChange={handleChange} placeholder="City, Area, Street" />
                {errors.location && <span className="modal-error">{errors.location}</span>}
              </div>
              <div className="modal-field">
                <label className="modal-label">Nearby Landmark</label>
                <input className="modal-input"
                  name="landmark" value={form.landmark} onChange={handleChange} placeholder="e.g. Near Central Station" />
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Date Last Seen</label>
              <input className="modal-input" name="lastSeenDate" value={form.lastSeenDate} onChange={handleChange} type="date" />
            </div>

            <div className="modal-section-label">Reporter Contact</div>
            <div className="modal-field">
              <label className="modal-label">Contact Number *</label>
              <input className={`modal-input${errors.contact ? " input-error" : ""}`}
                name="contact" value={form.contact} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
              {errors.contact && <span className="modal-error">{errors.contact}</span>}
            </div>

            <div className="modal-field">
              <label className="modal-label">Additional Description</label>
              <textarea className="modal-input modal-textarea"
                name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="Clothing, physical features, circumstances of disappearance…" />
            </div>

            {errors.submit && (
              <div className="modal-error" style={{ textAlign: "center", padding: "8px" }}>
                ⚠️ {errors.submit}
              </div>
            )}

            <div className="modal-actions">
              <button className="modal-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
              <button className="modal-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Registering…" : "Register Case →"}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function MissingPersonsExplorer() {
  const { can } = useRole();
  const canEdit = can("explorer_can_edit");

  const [persons, setPersons]           = useState([]);
  const [loadingList, setLoadingList]   = useState(true);
  const [fetchError, setFetchError]     = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAge, setFilterAge]       = useState("all");
  const [filterGender, setFilterGender] = useState("all");

  /* ── Fetch cases from backend on mount ── */
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res  = await fetch(`${BASE}/missing`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load cases");
        setPersons(data.cases.map(toCard));
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoadingList(false);
      }
    };
    fetchCases();
  }, []);

  const handleNewCase  = () => setShowModal(true);
  const handleCaseSubmit = (newCase) => setPersons((prev) => [newCase, ...prev]);

  /* Filter logic */
  const filtered = persons.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "High Priority"    && p.status === "high-priority") ||
      (filterStatus === "AI Match Pending" && p.status === "ai-pending") ||
      (filterStatus === "Resolved"         && p.status === "resolved");

    const matchAge =
      filterAge === "all" ||
      (filterAge === "Child (0-12)"  && p.age <= 12) ||
      (filterAge === "Teen (13-18)"  && p.age >= 13 && p.age <= 18) ||
      (filterAge === "Adult (18+)"   && p.age > 18);

    const matchGender =
      filterGender === "all" || p.gender.toLowerCase() === filterGender.toLowerCase();

    return matchSearch && matchStatus && matchAge && matchGender;
  });

  const clearFilters = () => {
    setSearch(""); setFilterStatus("all");
    setFilterAge("all"); setFilterGender("all");
  };

  return (
    <div className="explorer-page">

      {showModal && (
        <NewCaseModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCaseSubmit}
        />
      )}

      <div className="explorer-header">
        <div>
          <h2 className="explorer-title">Missing Persons Explorer</h2>
          <p className="explorer-sub">
            Browse and manage all registered missing person cases
            <span className="explorer-count"> · {filtered.length} records</span>
          </p>
        </div>
        {canEdit && (
          <button className="btn-add-case" onClick={handleNewCase}>
            + Register New Case
          </button>
        )}
      </div>

      <div className="explorer-filters">
        <div className="explorer-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by name, ID, location…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="explorer-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option>High Priority</option>
          <option>AI Match Pending</option>
          <option>Resolved</option>
        </select>
        <select className="explorer-select" value={filterAge} onChange={(e) => setFilterAge(e.target.value)}>
          <option value="all">All Ages</option>
          <option>Child (0-12)</option>
          <option>Teen (13-18)</option>
          <option>Adult (18+)</option>
        </select>
        <select className="explorer-select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
          <option value="all">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      {/* Loading state */}
      {loadingList && (
        <div className="explorer-empty">
          <div className="explorer-empty-icon">⏳</div>
          <div className="explorer-empty-text">Loading cases…</div>
        </div>
      )}

      {/* Fetch error */}
      {!loadingList && fetchError && (
        <div className="explorer-empty">
          <div className="explorer-empty-icon">⚠️</div>
          <div className="explorer-empty-text">{fetchError}</div>
          <button className="explorer-clear-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* Empty filter result */}
      {!loadingList && !fetchError && filtered.length === 0 && (
        <div className="explorer-empty">
          <div className="explorer-empty-icon">🔍</div>
          <div className="explorer-empty-text">No records match your filters</div>
          <button className="explorer-clear-btn" onClick={clearFilters}>Clear Filters</button>
        </div>
      )}

      {/* Cards grid */}
      {!loadingList && !fetchError && filtered.length > 0 && (
        <div className="explorer-grid">
          {filtered.map((p) => (
            <div key={p.id} className={`explorer-card ${p.status}`}>
              <div className="explorer-card-top">
                <img src={p.photoUrl} alt={p.name} className="explorer-photo"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                <div className="explorer-photo-fallback" style={{ display: "none" }}>{p.initials}</div>
                <div className="explorer-card-info">
                  <div className="explorer-card-name">{p.name}</div>
                  <div className="explorer-card-id">{typeof p.id === "string" && p.id.startsWith("MP-") ? p.id : `ID: ${String(p.id).slice(-6)}`}</div>
                  <span className={`status-badge ${p.status}`}>
                    <span className="status-dot" />
                    {p.statusLabel}
                  </span>
                </div>
              </div>
              <div className="explorer-card-meta">
                <div className="explorer-meta-row"><span>Age</span><span>{p.age} · {p.gender}</span></div>
                <div className="explorer-meta-row"><span>Last Seen</span><span>{p.location}</span></div>
                <div className="explorer-meta-row"><span>Reported</span><span>{p.reported}</span></div>
              </div>
              <div className="explorer-card-actions">
                <button className="btn-view">View Details</button>
                {canEdit && <button className="btn-update">Update</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}