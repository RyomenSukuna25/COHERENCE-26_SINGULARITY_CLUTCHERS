import { useState, useEffect } from "react";
import MirrorPanel from "../components/MirrorPanel";
import LeadDetail from "../components/LeadDetail";
import PersonaPreview from "../components/PersonaPreview";
import SignalFeed from "../components/SignalFeed";
import SafetyMeters from "../components/SafetyMeters";

// ─── MOCK DATA (swap each fetchX() for real axios call when Jay's backend is live) ───
const MOCK_STATS = { totalLeads: 50, contacted: 38, replied: 6, avgMirrorScore: 74 };
const MOCK_LEADS = [
  { id: 1, name: "Rahul Sharma", company: "TechCorp", role: "CTO", email: "rahul@techcorp.com", stage: "Contacted", persona: "Dev", mirrorScore: 82, signal: "Opened" },
  { id: 2, name: "Priya Mehta", company: "GrowthX", role: "CEO", email: "priya@growthx.com", stage: "Replied", persona: "Arjun", mirrorScore: 91, signal: "Replied" },
  { id: 3, name: "Aakash Joshi", company: "Finova", role: "Manager", email: "aakash@finova.com", stage: "Cold", persona: "Priya", mirrorScore: 44, signal: "Gone Cold" },
  { id: 4, name: "Sneha Patil", company: "DataSync", role: "Founder", email: "sneha@datasync.com", stage: "Pending", persona: "Arjun", mirrorScore: 67, signal: null },
  { id: 5, name: "Vikram Nair", company: "CloudBase", role: "Engineer", email: "vikram@cloudbase.com", stage: "Contacted", persona: "Dev", mirrorScore: 78, signal: "Clicked" },
];

// ─── SWAP THESE when Jay's backend is live ───
// const fetchStats = () => axios.get('http://localhost:8000/api/dashboard/stats').then(r => r.data)
// const fetchLeads = () => axios.get('http://localhost:8000/api/leads/all').then(r => r.data)
const fetchStats = () => Promise.resolve(MOCK_STATS);
const fetchLeads = () => Promise.resolve(MOCK_LEADS);

// ─── HELPERS ───
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return time;
}

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ─── STAT CARD ───
function StatCard({ label, value, accent, sublabel, icon }) {
  const count = useCountUp(value);
  const colors = {
    purple: { border: "#7c3aed", glow: "rgba(124,58,237,0.35)", text: "#a78bfa" },
    green:  { border: "#34d399", glow: "rgba(52,211,153,0.35)", text: "#34d399" },
    red:    { border: "#f87171", glow: "rgba(248,113,113,0.30)", text: "#f87171" },
    yellow: { border: "#fbbf24", glow: "rgba(251,191,36,0.30)",  text: "#fbbf24" },
  };
  const c = colors[accent] || colors.purple;
  return (
    <div style={{
      background: "rgba(10,5,20,0.92)",
      border: `1px solid ${c.border}`,
      boxShadow: `0 0 18px ${c.glow}, inset 0 0 12px rgba(0,0,0,0.6)`,
      borderRadius: 8,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
      minWidth: 160,
      flex: 1,
    }}>
      {/* scanline overlay */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)", pointerEvents:"none" }} />
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#6b7280", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{icon} {label}</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:38, fontWeight:700, color: c.text, lineHeight:1, textShadow:`0 0 16px ${c.glow}` }}>{count}{label.includes("SCORE") ? "%" : ""}</div>
      {sublabel && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#4b5563", marginTop:6, letterSpacing:1 }}>{sublabel}</div>}
      {/* corner accent */}
      <div style={{ position:"absolute", top:0, right:0, width:24, height:24, borderBottom:`1px solid ${c.border}`, borderLeft:`1px solid ${c.border}`, opacity:0.5 }} />
    </div>
  );
}

// ─── SIGNAL BADGE ───
const SIGNAL_COLORS = { Replied:"#34d399", Opened:"#a78bfa", Clicked:"#60a5fa", "Gone Cold":"#6b7280", Bounced:"#f87171" };
function SignalBadge({ signal }) {
  if (!signal) return <span style={{ color:"#374151", fontFamily:"'Space Mono',monospace", fontSize:10 }}>—</span>;
  return (
    <span style={{
      background: `${SIGNAL_COLORS[signal] || "#6b7280"}22`,
      color: SIGNAL_COLORS[signal] || "#6b7280",
      border: `1px solid ${SIGNAL_COLORS[signal] || "#6b7280"}55`,
      borderRadius:4, padding:"2px 8px",
      fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:1,
      display:"inline-flex", alignItems:"center", gap:5
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background: SIGNAL_COLORS[signal] || "#6b7280", display:"inline-block",
        boxShadow:`0 0 6px ${SIGNAL_COLORS[signal] || "#6b7280"}`, animation: signal === "Opened" ? "pulse 1.5s infinite" : "none" }} />
      {signal.toUpperCase()}
    </span>
  );
}

// ─── MIRROR SCORE BAR ───
function MirrorBar({ score }) {
  const color = score >= 70 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${score}%`, height:"100%", background:color, boxShadow:`0 0 6px ${color}`, borderRadius:2, transition:"width 1s ease" }} />
      </div>
      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color, minWidth:28, textAlign:"right" }}>{score}</span>
    </div>
  );
}

// ─── PERSONA TAG ───
const PERSONA_COLORS = { Arjun:"#f87171", Priya:"#fbbf24", Dev:"#60a5fa" };
function PersonaTag({ persona }) {
  const c = PERSONA_COLORS[persona] || "#6b7280";
  return <span style={{ color:c, fontFamily:"'Space Mono',monospace", fontSize:11, letterSpacing:1 }}>● {persona}</span>;
}

// ─── NAV ───
function NavBar({ activePage, setPage, leadCount, clock }) {
  const pages = ["OVERVIEW", "LEADS", "SIGNALS", "SAFETY", "AI INTEL"];
  return (
    <header style={{ background:"rgba(3,7,18,0.97)", borderBottom:"1px solid #1f2937", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ display:"flex", alignItems:"center", gap:32 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#a78bfa", letterSpacing:2, textShadow:"0 0 16px rgba(167,139,250,0.5)" }}>
          ⚡ NEXUS
        </div>
        <span style={{ color:"#374151", fontSize:12 }}>/</span>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#4b5563", letterSpacing:2 }}>MISSION CONTROL</span>
      </div>
      <nav style={{ display:"flex", gap:4 }}>
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            background: activePage === p ? "rgba(124,58,237,0.18)" : "transparent",
            color: activePage === p ? "#a78bfa" : "#4b5563",
            border: activePage === p ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
            borderRadius:4, padding:"6px 14px",
            fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:1.5, cursor:"pointer",
            transition:"all 0.15s"
          }}>{p}</button>
        ))}
      </nav>
      <div style={{ display:"flex", alignItems:"center", gap:20 }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#4b5563" }}>
          LEADS <span style={{ color:"#7c3aed" }}>{leadCount}</span>
        </span>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#34d399", letterSpacing:1 }}>
          ● {clock.toLocaleTimeString("en-IN", { hour12:false })}
        </span>
      </div>
    </header>
  );
}

// ─── LEAD TABLE ───
function LeadTable({ leads, onSelect, selectedId }) {
  return (
    <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid #1f2937", borderRadius:8, overflow:"hidden" }}>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid #1f2937", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#6b7280", letterSpacing:2 }}>LEAD COMMAND CENTER</span>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#374151" }}>{leads.length} TARGETS LOADED</span>
      </div>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ borderBottom:"1px solid #111827" }}>
            {["LEAD","COMPANY","ROLE","PERSONA","MIRROR","SIGNAL","STAGE"].map(h => (
              <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontFamily:"'Space Mono',monospace", fontSize:9, color:"#374151", letterSpacing:2, fontWeight:400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => (
            <tr key={lead.id} onClick={() => onSelect(lead)}
              style={{
                borderBottom:"1px solid #0f172a",
                background: selectedId === lead.id ? "rgba(124,58,237,0.12)" : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                cursor:"pointer",
                transition:"background 0.12s",
              }}
              onMouseEnter={e => { if (selectedId !== lead.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (selectedId !== lead.id) e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"; }}
            >
              <td style={{ padding:"12px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%",
                    background:`linear-gradient(135deg, #7c3aed44, #1e1b4b)`,
                    border:"1px solid #3730a3",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'Space Mono',monospace", fontSize:10, color:"#a78bfa", flexShrink:0
                  }}>{lead.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#e5e7eb" }}>{lead.name}</div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#4b5563", marginTop:2 }}>{lead.email}</div>
                  </div>
                </div>
              </td>
              <td style={{ padding:"12px 16px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#9ca3af" }}>{lead.company}</td>
              <td style={{ padding:"12px 16px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#6b7280" }}>{lead.role}</td>
              <td style={{ padding:"12px 16px" }}><PersonaTag persona={lead.persona} /></td>
              <td style={{ padding:"12px 16px", minWidth:120 }}><MirrorBar score={lead.mirrorScore} /></td>
              <td style={{ padding:"12px 16px" }}><SignalBadge signal={lead.signal} /></td>
              <td style={{ padding:"12px 16px" }}>
                <span style={{
                  fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:1.5,
                  color: lead.stage==="Replied"?"#34d399":lead.stage==="Cold"?"#6b7280":lead.stage==="Contacted"?"#60a5fa":"#fbbf24",
                  textTransform:"uppercase"
                }}>{lead.stage}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── SECTION HEADER ───
function SectionHeader({ label, status }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:2, height:16, background:"#7c3aed", boxShadow:"0 0 8px #7c3aed" }} />
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#6b7280", letterSpacing:3, textTransform:"uppercase" }}>{label}</span>
      </div>
      {status && <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#34d399", letterSpacing:2 }}>● {status}</span>}
    </div>
  );
}

// ─── INTELLIGENCE PANEL ───
function IntelPanel({ stats }) {
  const items = [
    { label:"AVG MIRROR SCORE", value:`${stats.avgMirrorScore}%`, color:"#a78bfa" },
    { label:"REPLY RATE", value:`${((stats.replied/stats.totalLeads)*100).toFixed(1)}%`, color:"#34d399" },
    { label:"OUTREACH RATE", value:`${((stats.contacted/stats.totalLeads)*100).toFixed(1)}%`, color:"#60a5fa" },
    { label:"BEST PERSONA TODAY", value:"ARJUN", color:"#f87171" },
  ];
  return (
    <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid #1f2937", borderRadius:8, padding:20 }}>
      <SectionHeader label="Intelligence Summary" status="LIVE" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {items.map(item => (
          <div key={item.label} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid #111827", borderRadius:6, padding:"12px 14px" }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#374151", letterSpacing:2, marginBottom:6 }}>{item.label}</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:22, color:item.color, fontWeight:700, textShadow:`0 0 12px ${item.color}55` }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───
export default function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(MOCK_STATS);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activePage, setActivePage] = useState("OVERVIEW");
  const [loading, setLoading] = useState(true);
  const clock = useClock();

  useEffect(() => {
    Promise.all([fetchStats(), fetchLeads()]).then(([s, l]) => {
      setStats(s); setLeads(l); setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:"'Space Mono',monospace", color:"#7c3aed", fontSize:14, letterSpacing:3, animation:"pulse 1s infinite" }}>
        ⚡ NEXUS INITIALIZING...
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#030712", color:"#e5e7eb" }}>
      {/* CSS animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#030712; } ::-webkit-scrollbar-thumb { background:#1f2937; border-radius:2px; }
        body { background:#030712 !important; }
      `}</style>

      {/* grid background */}
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none", zIndex:0 }} />

      <div style={{ position:"relative", zIndex:1 }}>
        <NavBar activePage={activePage} setPage={setActivePage} leadCount={leads.length} clock={clock} />

        <main style={{ padding:"28px 32px", maxWidth:1600, margin:"0 auto" }}>

          {/* PAGE: OVERVIEW */}
          {activePage === "OVERVIEW" && (
            <div style={{ animation:"fadeInUp 0.3s ease" }}>
              {/* Stat cards row */}
              <div style={{ display:"flex", gap:16, marginBottom:28 }}>
                <StatCard label="Total Leads" value={stats.totalLeads} accent="purple" sublabel="LOADED IN SYSTEM" icon="👥" />
                <StatCard label="Contacted" value={stats.contacted} accent="green" sublabel="OUTREACH SENT" icon="📤" />
                <StatCard label="Replied" value={stats.replied} accent="yellow" sublabel="RESPONSES RECEIVED" icon="💬" />
                <StatCard label="Avg Mirror Score" value={stats.avgMirrorScore} accent="purple" sublabel="AI QUALITY INDEX" icon="🪞" />
              </div>

              {/* Main content area */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:20 }}>
                {/* Left column */}
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                  <div>
                    <SectionHeader label="Lead Command Center" status="LIVE" />
                    <LeadTable leads={leads} onSelect={setSelectedLead} selectedId={selectedLead?.id} />
                  </div>

                  {/* Mirror panel for selected lead */}
                  {selectedLead && (
                    <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, padding:20, animation:"fadeInUp 0.2s ease" }}>
                      <SectionHeader label={`Mirror Check — ${selectedLead.name}`} status="SCANNING" />
                      <MirrorPanel lead={selectedLead} />
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                  {/* Lead Detail */}
                  {selectedLead ? (
                    <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, padding:20, animation:"fadeInUp 0.2s ease" }}>
                      <SectionHeader label={`Profile — ${selectedLead.name}`} />
                      <LeadDetail lead={selectedLead} />
                    </div>
                  ) : (
                    <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid #1f2937", borderRadius:8, padding:32, textAlign:"center" }}>
                      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#374151", letterSpacing:2 }}>← SELECT A LEAD</div>
                      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#1f2937", marginTop:8 }}>to view full intelligence panel</div>
                    </div>
                  )}

                  <IntelPanel stats={stats} />
                </div>
              </div>
            </div>
          )}

          {/* PAGE: LEADS */}
          {activePage === "LEADS" && (
            <div style={{ animation:"fadeInUp 0.3s ease" }}>
              <SectionHeader label="All Leads" status={`${leads.length} LOADED`} />
              <LeadTable leads={leads} onSelect={setSelectedLead} selectedId={selectedLead?.id} />
              {selectedLead && (
                <div style={{ marginTop:20, background:"rgba(10,5,20,0.92)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, padding:20 }}>
                  <SectionHeader label={`Full Profile — ${selectedLead.name}`} />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                    <LeadDetail lead={selectedLead} />
                    <PersonaPreview lead={selectedLead} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE: SIGNALS */}
          {activePage === "SIGNALS" && (
            <div style={{ animation:"fadeInUp 0.3s ease" }}>
              <SectionHeader label="Signal Feed" status="LISTENING" />
              <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid #1f2937", borderRadius:8, padding:20 }}>
                <SignalFeed />
              </div>
            </div>
          )}

          {/* PAGE: SAFETY */}
          {activePage === "SAFETY" && (
            <div style={{ animation:"fadeInUp 0.3s ease" }}>
              <SectionHeader label="Safety Controls" status="NOMINAL" />
              <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:8, padding:24 }}>
                <SafetyMeters />
              </div>
            </div>
          )}

          {/* PAGE: AI INTEL */}
          {activePage === "AI INTEL" && (
            <div style={{ animation:"fadeInUp 0.3s ease" }}>
              <SectionHeader label="AI Intelligence" status="ACTIVE" />
              {selectedLead ? (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, padding:20 }}>
                    <SectionHeader label="Mirror Simulation" />
                    <MirrorPanel lead={selectedLead} />
                  </div>
                  <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:8, padding:20 }}>
                    <SectionHeader label="Persona Preview — All 3 Voices" />
                    <PersonaPreview lead={selectedLead} />
                  </div>
                </div>
              ) : (
                <div style={{ background:"rgba(10,5,20,0.92)", border:"1px solid #1f2937", borderRadius:8, padding:48, textAlign:"center" }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#374151", letterSpacing:2 }}>SELECT A LEAD IN OVERVIEW TO VIEW AI INTEL</div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}