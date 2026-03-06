import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'

const BOOT_LINES = [
  { text: '> Connecting to Google OAuth...', delay: 300, color: '#22c55e' },
  { text: '> Identity verified. Welcome, Chirag.', delay: 900, color: '#22c55e' },
  { text: '> Loading NEXUS Intelligence Layer v2...', delay: 1500, color: '#a855f7' },
  { text: '> AI Persona Engine: Arjun / Priya / Dev — READY', delay: 2100, color: '#a855f7' },
  { text: '> MIRROR Simulation Layer — ONLINE', delay: 2700, color: '#06b6d4' },
  { text: '> Lead Enrichment Pipeline — ACTIVE', delay: 3200, color: '#06b6d4' },
  { text: '> 50 leads loaded. Signal feed connected.', delay: 3700, color: '#f8fafc' },
  { text: '> ALL SYSTEMS OPERATIONAL █', delay: 4200, color: '#22c55e' },
]

function BootLine({ text, delay, color }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  if (!visible) return null
  return (
    <p style={{
      color, fontSize: 13, marginBottom: 10,
      fontFamily: 'JetBrains Mono, monospace',
      animation: 'slideIn 0.3s ease forwards',
    }}>{text}</p>
  )
}

function LoginPage({ onLogin }) {
  const [phase, setPhase] = useState('idle') // idle | booting

  const handleLogin = () => {
    setPhase('booting')
    setTimeout(() => onLogin({ displayName: 'Chirag', email: 'chirag@nexus.ai' }), 4800)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'JetBrains Mono, monospace', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&display=swap');
        @keyframes gridFloat { 0%{transform:translateY(0)} 100%{transform:translateY(32px)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes orb { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        .login-btn { transition: all 0.3s ease; cursor: pointer; }
        .login-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 0 50px rgba(168,85,247,0.7) !important; }
      `}</style>

      {/* Grid bg */}
      <div style={{
        position: 'absolute', inset: '-32px',
        backgroundImage: 'linear-gradient(rgba(168,85,247,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.07) 1px,transparent 1px)',
        backgroundSize: '32px 32px', animation: 'gridFloat 6s linear infinite',
      }}/>

      {/* Glow orbs */}
      <div style={{ position:'absolute', top:'15%', left:'20%', width:500, height:500,
        background:'radial-gradient(circle,rgba(168,85,247,0.1) 0%,transparent 70%)',
        filter:'blur(80px)', animation:'orb 6s ease infinite' }}/>
      <div style={{ position:'absolute', bottom:'15%', right:'20%', width:350, height:350,
        background:'radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 70%)',
        filter:'blur(60px)' }}/>

      {phase === 'idle' ? (
        <div style={{
          background: 'rgba(13,13,20,0.92)', border: '1px solid rgba(168,85,247,0.25)',
          borderRadius: 24, padding: '52px 48px', width: 420, textAlign: 'center',
          position: 'relative', backdropFilter: 'blur(40px)',
          boxShadow: '0 0 80px rgba(168,85,247,0.12), 0 0 200px rgba(168,85,247,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
          animation: 'fadeUp 0.8s ease',
        }}>
          <div style={{ position:'absolute', top:0, left:'25%', right:'25%', height:1,
            background:'linear-gradient(90deg,transparent,#a855f7,transparent)' }}/>

          <div style={{ fontSize: 52, marginBottom: 14,
            filter: 'drop-shadow(0 0 24px rgba(168,85,247,0.9))' }}>⚡</div>

          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize: 52, fontWeight: 800,
            margin: '0 0 4px',
            background: 'linear-gradient(135deg,#e9d5ff 0%,#a855f7 50%,#7c3aed 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: -3 }}>
            NEXUS
          </h1>
          <p style={{ color:'#581c87', fontSize: 10, letterSpacing: 5, marginBottom: 4 }}>
            OUTREACH INTELLIGENCE PLATFORM
          </p>
          <p style={{ color:'#1f2937', fontSize: 10, letterSpacing: 2, marginBottom: 28 }}>
            COHERENCE '26 — SINGULARITY CLUTCHERS
          </p>

          <div style={{ background:'rgba(168,85,247,0.04)', border:'1px solid rgba(168,85,247,0.12)',
            borderRadius: 12, padding:'16px 20px', marginBottom: 28, textAlign:'left' }}>
            {[
              ['AI Personas Active', '3', '#22c55e'],
              ['Mirror Simulation', 'ONLINE', '#22c55e'],
              ['Lead Enrichment', 'READY', '#22c55e'],
              ['Signal Feed', 'LIVE', '#06b6d4'],
            ].map(([k,v,c]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between',
                padding:'6px 0', borderBottom:'1px solid rgba(168,85,247,0.06)' }}>
                <span style={{ color:'#4b5563', fontSize: 11 }}>{k}</span>
                <span style={{ color:c, fontSize: 11, fontWeight: 700 }}>● {v}</span>
              </div>
            ))}
          </div>

          <button onClick={handleLogin} className='login-btn' style={{
            width: '100%', padding: '16px 24px',
            background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
            border: 'none', borderRadius: 14, color: 'white',
            fontFamily: 'JetBrains Mono,monospace', fontSize: 14, fontWeight: 700,
            boxShadow: '0 0 30px rgba(168,85,247,0.4)',
            display: 'flex', alignItems:'center', justifyContent:'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ position:'absolute', bottom:0, left:'25%', right:'25%', height:1,
            background:'linear-gradient(90deg,transparent,rgba(168,85,247,0.4),transparent)' }}/>
        </div>
      ) : (
        <div style={{
          background: 'rgba(5,5,8,0.98)', border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 20, padding: '44px 48px', width: 540,
          boxShadow: '0 0 60px rgba(34,197,94,0.08)',
          animation: 'fadeUp 0.4s ease',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: 24 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e',
              animation:'pulse 1s infinite' }}/>
            <p style={{ color:'#374151', fontSize: 11, letterSpacing: 3 }}>
              NEXUS v2 // BOOT SEQUENCE
            </p>
          </div>
          {BOOT_LINES.map((l, i) => <BootLine key={i} {...l} />)}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  return user
    ? <Dashboard user={user} onSignOut={() => setUser(null)} />
    : <LoginPage onLogin={setUser} />
}