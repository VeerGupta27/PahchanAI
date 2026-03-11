import "./MissingPersonsExplorer.css";
import { useRole } from "../context/RoleContext";

const ALL_PERSONS = [
  { id: "MP-2891", name: "Anya Sharma",    age: 16, location: "Bangalore, MG Road",   status: "high-priority", statusLabel: "Active – High Priority", initials: "AS", photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",  reported: "2 days ago",  gender: "Female" },
  { id: "MP-2876", name: "Vikram Singh",   age: 35, location: "Mumbai, Juhu Beach",    status: "ai-pending",    statusLabel: "AI Match Pending",       initials: "VS", photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",    reported: "4 days ago",  gender: "Male" },
  { id: "MP-2863", name: "Jarmet Shanaan", age: 16, location: "Bangalore, MG Road",   status: "ai-pending",    statusLabel: "AI Match Pending",       initials: "JS", photoUrl: "https://randomuser.me/api/portraits/men/56.jpg",    reported: "5 days ago",  gender: "Male" },
  { id: "MP-2851", name: "Priya Mehta",    age: 14, location: "Pune, Koregaon Park",  status: "high-priority", statusLabel: "Active – High Priority", initials: "PM", photoUrl: "https://randomuser.me/api/portraits/women/62.jpg",  reported: "1 week ago",  gender: "Female" },
  { id: "MP-2840", name: "Rajan Iyer",     age: 52, location: "Chennai, T. Nagar",    status: "resolved",      statusLabel: "Resolved",               initials: "RI", photoUrl: "https://randomuser.me/api/portraits/men/71.jpg",    reported: "2 weeks ago", gender: "Male" },
  { id: "MP-2835", name: "Sunita Devi",    age: 28, location: "Kolkata, Park Street", status: "high-priority", statusLabel: "Active – High Priority", initials: "SD", photoUrl: "https://randomuser.me/api/portraits/women/29.jpg",  reported: "3 days ago",  gender: "Female" },
  { id: "MP-2821", name: "Arjun Nair",     age: 9,  location: "Kochi, MG Road",       status: "ai-pending",    statusLabel: "AI Match Pending",       initials: "AN", photoUrl: "https://randomuser.me/api/portraits/men/15.jpg",    reported: "6 days ago",  gender: "Male" },
  { id: "MP-2810", name: "Meena Pillai",   age: 45, location: "Hyderabad, Banjara",   status: "resolved",      statusLabel: "Resolved",               initials: "MP", photoUrl: "https://randomuser.me/api/portraits/women/55.jpg",  reported: "3 weeks ago", gender: "Female" },
];

export default function MissingPersonsExplorer() {
  const { can } = useRole();
  const canEdit = can("explorer_can_edit");
  return (
    <div className="explorer-page">
      <div className="explorer-header">
        <div>
          <h2 className="explorer-title">Missing Persons Explorer</h2>
          <p className="explorer-sub">Browse and manage all registered missing person cases</p>
        </div>
        {canEdit && <button className="btn-add-case">+ Register New Case</button>}
      </div>

      {/* Filter bar */}
      <div className="explorer-filters">
        <div className="explorer-search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by name, ID, location…" />
        </div>
        <select className="explorer-select">
          <option>All Status</option>
          <option>High Priority</option>
          <option>AI Match Pending</option>
          <option>Resolved</option>
        </select>
        <select className="explorer-select">
          <option>All Ages</option>
          <option>Child (0–12)</option>
          <option>Teen (13–18)</option>
          <option>Adult (18+)</option>
        </select>
        <select className="explorer-select">
          <option>All Genders</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>

      {/* Cards grid */}
      <div className="explorer-grid">
        {ALL_PERSONS.map((p) => (
          <div key={p.id} className={`explorer-card ${p.status}`}>
            <div className="explorer-card-top">
              <img src={p.photoUrl} alt={p.name} className="explorer-photo"
                onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
              <div className="explorer-photo-fallback" style={{ display: "none" }}>{p.initials}</div>
              <div className="explorer-card-info">
                <div className="explorer-card-name">{p.name}</div>
                <div className="explorer-card-id">{p.id}</div>
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
    </div>
  );
}
