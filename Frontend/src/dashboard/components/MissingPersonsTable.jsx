import "./MissingPersonsTable.css";
import { useRole } from "../context/RoleContext";

const PERSONS = [
  { id:"MP-2891", name:"Anya Sharma",    age:16, location:"Bangalore, MG Road",  status:"high-priority", statusLabel:"Active – High Priority", initials:"AS", photoUrl:"https://randomuser.me/api/portraits/women/44.jpg" },
  { id:"MP-2876", name:"Vikram Singh",   age:35, location:"Mumbai, Juhu Beach",   status:"ai-pending",    statusLabel:"AI Match Pending",       initials:"VS", photoUrl:"https://randomuser.me/api/portraits/men/32.jpg" },
  { id:"MP-2863", name:"Jarmet Shanaan", age:16, location:"Bangalore, MG Road",  status:"ai-pending",    statusLabel:"AI Match Pending",       initials:"JS", photoUrl:"https://randomuser.me/api/portraits/men/56.jpg" },
  { id:"MP-2851", name:"Priya Mehta",    age:14, location:"Pune, Koregaon Park", status:"high-priority", statusLabel:"Active – High Priority", initials:"PM", photoUrl:"https://randomuser.me/api/portraits/women/62.jpg" },
  { id:"MP-2840", name:"Rajan Iyer",     age:52, location:"Chennai, T. Nagar",   status:"resolved",      statusLabel:"Resolved",               initials:"RI", photoUrl:"https://randomuser.me/api/portraits/men/71.jpg" },
];

export default function MissingPersonsTable() {
  const { can } = useRole();
  const canEdit = can("explorer_can_edit");

  return (
    <div className="persons-table-panel card">
      <div className="card-header">
        <span className="card-title">Missing Persons</span>
        <div className="table-header-actions">
          {canEdit && (
            <>
              <button className="table-filter-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filter
              </button>
              <button className="table-filter-btn">Export</button>
            </>
          )}
          {!canEdit && (
            <span className="table-readonly-tag">Read-only</span>
          )}
        </div>
      </div>

      <div className="persons-table-wrap">
        <table className="persons-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Age</th>
              <th>Last Seen Location</th>
              <th>Status</th>
              {canEdit && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {PERSONS.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={p.photoUrl} alt={p.name} className="person-photo"
                    onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}/>
                  <div className="person-photo-placeholder" style={{display:"none"}}>{p.initials}</div>
                </td>
                <td className="person-name">{p.name}</td>
                <td>{p.age}</td>
                <td>{p.location}</td>
                <td>
                  <span className={`status-badge ${p.status}`}>
                    <span className="status-dot"/>
                    {p.statusLabel}
                  </span>
                </td>
                {canEdit && (
                  <td>
                    <div className="action-group">
                      <button className="btn-view">View Details</button>
                      <button className="btn-update">Update</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
