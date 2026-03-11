import "./StatsRow.css";
import { useRole } from "../context/RoleContext";

function Sparkline({ color, points }) {
  const w = 120, h = 36;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const ys = points.map((p) => h - ((p - min) / (max - min + 1)) * (h - 6) - 3);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const fill = `${d} L${w},${h} L0,${h} Z`;
  return (
    <div className="stat-sparkline">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#sg-${color.replace("#","")})`}/>
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* All 4 stats visible to officer */
const ALL_STATS = [
  {
    label: "Active Missing Cases", value: "1,245", sub: "↑ +12 this week",
    subClass: "neutral", accent: "blue", color: "#3b82f6",
    spark: [30,45,38,52,47,60,55,70,65,80],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>),
  },
  {
    label: "AI Matches Found", value: "312", sub: "Today: +18",
    subClass: "positive", accent: "cyan", color: "#22d3ee",
    spark: [20,35,28,42,38,55,50,62,58,75],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><circle cx="11" cy="11" r="3"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  },
  {
    label: "Citizen Sightings", value: "5,678", sub: "Last 24h: +45",
    subClass: "positive", accent: "orange", color: "#f97316",
    spark: [50,62,55,70,65,80,75,88,82,95],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>),
  },
  {
    label: "Resolved Cases", value: "8,902", sub: "92% Success Rate",
    subClass: "positive", accent: "green", color: "#22c55e",
    spark: [40,55,48,63,58,72,68,82,78,92],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
  },
];

/* Reduced stats visible to partner — no AI data, no biometrics */
const PARTNER_STATS = [
  {
    label: "Open Cases in Network", value: "1,245", sub: "↑ +12 this week",
    subClass: "neutral", accent: "blue", color: "#3b82f6",
    spark: [30,45,38,52,47,60,55,70,65,80],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>),
  },
  {
    label: "Sightings Reported", value: "5,678", sub: "Last 24h: +45",
    subClass: "positive", accent: "orange", color: "#f97316",
    spark: [50,62,55,70,65,80,75,88,82,95],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>),
  },
  {
    label: "Resolved Cases", value: "8,902", sub: "92% Success Rate",
    subClass: "positive", accent: "green", color: "#22c55e",
    spark: [40,55,48,63,58,72,68,82,78,92],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
  },
];

export default function StatsRow() {
  const { role, can } = useRole();
  const stats = can("data_full_stats") ? ALL_STATS : PARTNER_STATS;

  return (
    <div className={`stats-row stats-row--${stats.length}`}>
      {stats.map((s) => (
        <div key={s.label} className={`stat-card ${s.accent}`}>
          <div className="stat-top">
            <span className="stat-label">{s.label}</span>
            <div className={`stat-icon ${s.accent}`}>{s.icon}</div>
          </div>
          <div className="stat-value">{s.value}</div>
          <div className={`stat-sub ${s.subClass}`}>{s.sub}</div>
          <Sparkline color={s.color} points={s.spark}/>
        </div>
      ))}
    </div>
  );
}
