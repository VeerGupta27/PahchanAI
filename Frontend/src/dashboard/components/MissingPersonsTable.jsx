import { useState, useEffect } from "react";
import "./MissingPersonsTable.css";
import { useRole } from "../context/RoleContext";

const BASE = "https://pahchanai.onrender.com";

export default function MissingPersonsTable() {

  const { can } = useRole();
  const canEdit = can("explorer_can_edit");

  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {

    const fetchPersons = async () => {

      try {

        const res = await fetch(`${BASE}/ai/get-missing`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setPersons(data.suspects || []);

      } catch (err) {

        console.error("Failed to fetch persons", err);

      } finally {

        setLoading(false);

      }

    };

    fetchPersons();

  }, []);

  const filteredPersons = persons.filter((p) =>
    p.location?.toLowerCase().includes(locationFilter.toLowerCase())
  );

  return (
    <div className="persons-table-panel card">

      <div className="card-header">
        <span className="card-title">Missing Persons</span>

        <div className="table-header-actions">

          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="table-filter-input"
          />

          {canEdit ? (
            <>
              <button className="table-filter-btn">Filter</button>
              <button className="table-filter-btn">Export</button>
            </>
          ) : (
            <span className="table-readonly-tag">Read-only</span>
          )}

        </div>
      </div>

      <div className="persons-table-wrap">

        {loading ? (
          <div style={{ padding: "20px" }}>Loading...</div>
        ) : (

        <table className="persons-table">

          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Location</th>
              <th>Reported</th>
              {canEdit && <th>Action</th>}
            </tr>
          </thead>

          <tbody>

            {filteredPersons.map((p) => (

              <tr key={p._id}>

                <td>
                  <img
                    src={`${BASE}/${p.image}`}
                    alt={p.name}
                    className="person-photo"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="person-photo-placeholder" style={{ display: "none" }}>
                    {p.name?.slice(0,2).toUpperCase()}
                  </div>
                </td>

                <td className="person-name">{p.name}</td>

                <td>{p.location}</td>

                <td>
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>

                {canEdit && (
                  <td>
                    <div className="action-group">
                      <button className="btn-view">View</button>
                      <button className="btn-update">Update</button>
                    </div>
                  </td>
                )}

              </tr>

            ))}

          </tbody>

        </table>

        )}

      </div>

    </div>
  );
}