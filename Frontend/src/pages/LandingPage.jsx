import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

/* ─── animated counter ─────────────────────────────────────── */
function Counter({ target, suffix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── main app ─────────────────────────────────────────────── */
export default function LandingPage() {
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();

  const howItWorksSteps = [
    {
      n: "01",
      color: "#3b82f6",
      title: "Detection",
      sub: "YOLOv8 Engine",
      desc: "Scans live or uploaded footage frame-by-frame. Detects faces under occlusion, low-light, and crowd density conditions.",
      code: "yolo.predict(source='cam_01')",
    },
    {
      n: "02",
      color: "#818cf8",
      title: "Encoding",
      sub: "FaceNet 128-D",
      desc: "Converts detected faces into 128-dimensional mathematical embeddings — a unique biometric fingerprint per individual.",
      code: "vec = facenet.embed(face_crop)",
    },
    {
      n: "03",
      color: "#22d3ee",
      title: "Matching",
      sub: "Vector DB Search",
      desc: "Queries the identity database using cosine similarity to surface the top match within a millisecond. Alert sent instantly.",
      code: "db.search(vec, k=1, thresh=.82)",
    },
  ];

  const features = [
    { icon: "⚡", color: "#facc15", title: "Sub-second Search",    desc: "Vector similarity search across millions of embeddings returns results before a human blink." },
    { icon: "🛰",  color: "#60a5fa", title: "Multi-feed Ingestion", desc: "Connect CCTV networks, uploaded images, or mobile captures from a unified API endpoint." },
    { icon: "🔒", color: "#4ade80", title: "End-to-End Encrypted", desc: "All biometric data encrypted at rest and in transit. GDPR-compliant with full audit trails." },
    { icon: "📍", color: "#f87171", title: "Geo-tagged Sightings",  desc: "Every match is paired with timestamp and camera GPS coordinates for rapid dispatch routing." },
    { icon: "📊", color: "#c084fc", title: "Confidence Scoring",   desc: "Each result carries a confidence score. Threshold tuning prevents false positives in sensitive ops." },
    { icon: "🤝", color: "#fb923c", title: "Partner API",          desc: "RESTful API + webhook support. Integrates with existing law enforcement and NGO platforms." },
  ];

  const stats = [
    { target: 12480, suffix: "+",  label: "People Identified" },
    { target: 340,   suffix: "+",  label: "Partner Agencies" },
    { target: 99,    suffix: ".1%",label: "Match Accuracy" },
    { target: 1,     suffix: "M+", label: "Faces Indexed" },
  ];

  const trustBadges = [
    ["99.1%", "Match Accuracy"],
    ["0.42ms", "Search Speed"],
    ["1M+", "Records Indexed"],
  ];

  return (
    <>
      {modal && <Modal mode={modal} onClose={() => setModal(null)} />}

      {/* ── HERO ── */}
      <section className="hero-section grid-bg">
        <div className="hero-orb glow-orb" />

        <div className="hero-grid">
          {/* left */}
          <div>
            <div className="tag fade-up hero-tag">
              <span className="tag-dot" />
              AI-Powered · Live Search Active
            </div>

            <h1 className="sora hero-heading fade-up delay-1">
              Reuniting Families<br />
              <span >Through Vision AI.</span>
            </h1>

            <p className="hero-description fade-up delay-2">
              UnitySight uses <strong>YOLOv8 detection</strong>,{" "}
              <strong>FaceNet embeddings</strong>, and real-time vector search to
              identify missing individuals across surveillance networks — in under
              a millisecond.
            </p>

  {/*          <div className="hero-cta-group fade-up delay-3">
              <button className="btn-primary btn-hero-primary" onClick={() => navigate("/signup")}>
                Start Searching →
              </button>
              <button className="btn-ghost btn-hero-ghost">
                Watch Demo
              </button>
            </div>
*/} 
            {/* trust badges */}
            <div className="hero-trust-badges fade-up delay-4">
              {trustBadges.map(([v, l]) => (
                <div key={l}>
                  <div className="sora trust-badge-value">{v}</div>
                  <div className="trust-badge-label">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right — detection mockup */}
          <div className="mockup-wrap">
            <div className="mockup-frame">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=900&auto=format&fit=crop"
                alt="demo"
                className="mockup-img"
              />
              <div className="scan-line" />

              {/* detection box */}
              <div className="detection-box">
                <div className="detection-label mono">ID:88291 · 98.2% · LIVE</div>
                <div className="detection-corner tl" />
                <div className="detection-corner tr" />
                <div className="detection-corner bl" />
                <div className="detection-corner br" />
              </div>

              {/* overlay badges */}
              <div className="mockup-badges">
                <div className="mockup-badge mono">
                  <span>CCTV_01</span>
                  <span className="badge-live">LIVE</span>
                </div>
                <div className="mockup-badge mono">
                  <span>SECTOR_4B</span>
                  <span className="badge-match">MATCH</span>
                </div>
              </div>
            </div>

            {/* floating card */}
            <div className="mockup-float-card">
              <div className="float-card-label">Vector Search</div>
              <div className="sora float-card-value">0.42ms</div>
              <div className="float-card-sub">Across 1M+ records</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />
      

   

      {/* ── IMPACT STATS ── */}
      <section id="impact" className="section-impact">
        <div className="impact-inner">
          <div className="tag">Impact</div>
          <h2 className="sora section-title" style={{ marginBottom: 56 }}>
            Real Results, Real Families
          </h2>
          <div className="impact-grid">
            {stats.map((s) => (
              <div key={s.label} className="impact-card">
                <div className="sora impact-value count-in">
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <div className="impact-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── CTA BAND ── */}
      <section className="section-cta">
        <div className="cta-inner">
          <div className="cta-top-line" />
          <h2 className="sora cta-title">Ready to Join the Network?</h2>
          <p className="cta-subtitle">
            Police departments, NGOs, and volunteer organizations — apply for
            authorized access and start protecting lives today.
          </p>
          <div className="cta-actions">
            <button className="btn-primary btn-cta-primary" onClick={() => navigate("/signup")}>
              Apply for Partner Access
            </button>
            <button className="btn-ghost btn-cta-ghost" onClick={() => navigate("/signin")}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="sora footer-brand-name">UnitySight AI</span>
            <span>© 2025 · Dedicated to Public Safety</span>
          </div>
          <div className="footer-links">
            {["GitHub", "Privacy Policy", "Terms"].map((l) => (
              <a key={l} href="#" className="footer-link">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}