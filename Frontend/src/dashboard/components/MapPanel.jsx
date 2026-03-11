import "./MapPanel.css";

const PINS = [
  { type: "blue",   top: "28%", left: "35%", icon: "location" },
  { type: "blue",   top: "18%", left: "55%", icon: "location" },
  { type: "blue",   top: "42%", left: "20%", icon: "location" },
  { type: "blue",   top: "52%", left: "48%", icon: "location" },
  { type: "blue",   top: "62%", left: "60%", icon: "location" },
  { type: "orange", top: "45%", left: "40%", icon: "eye" },
  { type: "orange", top: "58%", left: "28%", icon: "eye" },
  { type: "green",  top: "38%", left: "62%", icon: "eye" },
  { type: "green",  top: "68%", left: "72%", icon: "eye" },
];

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    </svg>
  );
}

export default function MapPanel() {
  return (
    <div className="map-panel card">
      <div className="card-header">
        <span className="card-title">Live Map Tracking</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)", display: "inline-block", animation: "pulse-dot 2s ease infinite" }} />
          LIVE
        </div>
      </div>

      <div className="map-viewport">
        {/* Base map image (OpenStreetMap-style dark placeholder) */}
        <svg className="map-bg" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <rect width="800" height="500" fill="#0a1525" />
          {/* Road network approximation */}
          {[...Array(12)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 45} x2="800" y2={i * 45 + (Math.random() * 30 - 15)} stroke="rgba(56,139,253,0.08)" strokeWidth="1" />
          ))}
          {[...Array(16)].map((_, i) => (
            <line key={`v${i}`} x1={i * 55} y1="0" x2={i * 55 + (Math.random() * 20 - 10)} y2="500" stroke="rgba(56,139,253,0.08)" strokeWidth="1" />
          ))}
          {/* Major roads */}
          <path d="M0 180 Q200 160 400 200 Q600 240 800 220" stroke="rgba(56,139,253,0.2)" strokeWidth="2.5" fill="none" />
          <path d="M0 300 Q250 280 500 310 Q650 330 800 300" stroke="rgba(56,139,253,0.15)" strokeWidth="2" fill="none" />
          <path d="M200 0 Q220 150 240 250 Q260 370 280 500" stroke="rgba(56,139,253,0.15)" strokeWidth="2" fill="none" />
          <path d="M520 0 Q510 120 530 250 Q550 380 540 500" stroke="rgba(56,139,253,0.12)" strokeWidth="1.5" fill="none" />
          {/* Blocks */}
          {[
            [60, 60, 90, 55], [180, 50, 70, 60], [310, 40, 110, 70],
            [50, 140, 80, 50], [160, 150, 60, 45], [260, 135, 90, 55],
            [380, 145, 100, 50], [500, 130, 80, 60],
            [50, 220, 75, 55], [160, 230, 65, 50], [360, 220, 85, 55],
            [480, 215, 95, 60], [620, 200, 70, 65],
            [50, 310, 80, 50], [180, 305, 60, 55], [280, 315, 95, 50],
            [420, 310, 75, 55], [540, 300, 80, 60], [650, 295, 90, 55],
            [60, 390, 85, 50], [190, 385, 70, 55], [320, 390, 90, 50],
            [460, 380, 75, 55], [580, 375, 85, 55],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(56,139,253,0.04)" stroke="rgba(56,139,253,0.08)" strokeWidth="0.5" rx="2" />
          ))}
        </svg>

        <div className="map-grid-overlay" />
        <div className="map-scan" />

        {/* Controls */}
        <div className="map-controls">
          <div className="map-ctrl-btn">+</div>
          <div className="map-ctrl-btn">−</div>
        </div>

        {/* Filter Overlay */}
        <div className="map-filter">
          <div className="map-filter-title">Filter</div>
          {[
            { color: "#3b82f6", label: "Last Seen Locations" },
            { color: "#f97316", label: "AI Detections" },
            { color: "#22c55e", label: "Citizen Sightings" },
          ].map((f) => (
            <div key={f.label} className="map-filter-item">
              <div className="map-filter-dot" style={{ background: f.color }} />
              {f.label}
            </div>
          ))}
          <div className="filter-sep" />
          <div className="map-filter-section">Date</div>
          <input className="map-date-input" type="text" placeholder="Date Range" readOnly />
          <button className="map-heatmap-btn">
            🔥 Heatmaps
          </button>
        </div>

        {/* Pins */}
        {PINS.map((pin, i) => (
          <div key={i} className="map-pin" style={{ top: pin.top, left: pin.left }}>
            <div className={`map-pin-bubble ${pin.type}`}>
              {pin.icon === "eye" ? <EyeIcon /> : <LocationIcon />}
            </div>
            <div className="map-pin-stem" />
          </div>
        ))}
      </div>
    </div>
  );
}