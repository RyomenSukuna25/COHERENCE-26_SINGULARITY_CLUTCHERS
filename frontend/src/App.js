import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'

function LoginPage({ onLogin }) {
  const [phase, setPhase] = useState('idle') // idle → loading → booting → done

  const handleLogin = () => {
    setPhase('loading')
    setTimeout(() => setPhase('booting'), 1500)
    setTimeout(() => onLogin({ displayName: 'Chirag' }), 3800)
  }

  const bootLines = [
    '> Initializing NEXUS v2...',
    '> Loading AI persona engine...',
    '> Connecting Mirror simulation layer...',
    '> Fetching lead intelligence...',
    '> All systems operational.',
    '> Welcome, Chirag.',
  ]

  return (
    <div style={{
      minHeight: '100vh', background: '#030712',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Space Mono', monospace", position: 'relative', overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes gridMove { 0%{transform:translateY(0)} 100%{transform:translateY(40px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes scanline { 0%{top:-20%} 100%{top:120%} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bootIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .boot-line { animation: bootIn 0.3s ease forwards; opacity: 0; }
        .nexus-btn:hover { transform:translateY(-2px); box-shadow: 0 0 50px rgba(124,58,237,0.7) !important; }
        .nexus-btn { transition: all 0.3s ease; }
      `}</style>

      {/* Grid */}
      <div style={{
        position:'absolute', inset:0, overflow:'hidden', opacity:0.4
      }}>
        <div style={{
          position:'absolute', inset:'-40px',
          backgroundImage:`linear-gradient(rgba(124,58,237,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.12) 1px,transparent 1px)`,
          backgroundSize:'40px 40px',
          animation:'gridMove 3s linear infinite'
        }}/>
      </div>

      {/* Glow blobs */}
      <div style={{position:'absolute',top:'10%',left:'10%',width:400,height:400,background:'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)',filter:'blur(60px)'}}/>
      <div style={{position:'absolute',bottom:'10%',right:'10%',width:300,height:300,background:'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)',filter:'blur(60px)'}}/>

      {phase !== 'booting' ? (
        <div style={{
          animation:'fadeUp 0.8s ease forwards',
          background:'rgba(5,0,15,0.95)',
          border:'1px solid rgba(124,58,237,0.35)',
          borderRadius:20, padding:'52px 44px', width:400,
          textAlign:'center', position:'relative',
          backdropFilter:'blur(30px)',
          boxShadow:'0 0 80px rgba(124,58,237,0.15), 0 0 160px rgba(124,58,237,0.05), inset 0 1px 0 rgba(255,255,255,0.04)'
        }}>
          {/* Top accent line */}
          <div style={{position:'absolute',top:0,left:'20%',right:'20%',height:1,background:'linear-gradient(90deg,transparent,#7c3aed,transparent)'}}/>

          <div style={{fontSize:52,marginBottom:12,filter:'drop-shadow(0 0 20px rgba(124,58,237,0.8))'}}>⚡</div>
          <h1 style={{
            fontFamily:"'Syne',sans-serif", fontSize:48, fontWeight:800, margin:'0 0 6px',
            background:'linear-gradient(135deg,#c4b5fd 0%,#7c3aed 50%,#4f46e5 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'-2px'
          }}>NEXUS</h1>
          <p style={{color:'#581c87',fontSize:10,letterSpacing:5,marginBottom:6,textTransform:'uppercase'}}>Outreach Intelligence Platform</p>
          <div style={{width:48,height:1,background:'linear-gradient(90deg,transparent,#7c3aed,transparent)',margin:'0 auto 28px'}}/>

          <div style={{
            background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.15)',
            borderRadius:10, padding:'16px 20px', marginBottom:28, textAlign:'left'
          }}>
            {[
              ['Total Leads Enriched','50'],
              ['Avg Mirror Score','74 / 100'],
              ['Active Personas','3'],
            ].map(([k,v]) => (
              <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(124,58,237,0.08)'}}>
                <span style={{color:'#4b5563',fontSize:11}}>{k}</span>
                <span style={{color:'#a78bfa',fontSize:11,fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>

          <button onClick={handleLogin} disabled={phase==='loading'} className='nexus-btn' style={{
            width:'100%', padding:'15px 24px',
            background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
            border:'1px solid rgba(167,139,250,0.3)',
            borderRadius:12, color:'white',
            fontFamily:"'Space Mono',monospace", fontSize:13, fontWeight:700,
            cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', gap:10,
            boxShadow:'0 0 30px rgba(124,58,237,0.4)',
            position:'relative', overflow:'hidden'
          }}>
            {phase==='loading'
              ? <><span style={{display:'inline-block',animation:'spin 0.8s linear infinite',fontSize:16}}>⟳</span> Authenticating...</>
              : <><span>🔵</span> Continue with Google</>
            }
          </button>

          <p style={{color:'#1f2937',fontSize:10,marginTop:24,letterSpacing:2}}>COHERENCE '26 — SINGULARITY CLUTCHERS</p>
          <div style={{position:'absolute',bottom:0,left:'20%',right:'20%',height:1,background:'linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)'}}/>
        </div>
      ) : (
        // BOOT SEQUENCE
        <div style={{
          width:480, fontFamily:"'Space Mono',monospace",
          background:'rgba(5,0,15,0.98)',
          border:'1px solid rgba(124,58,237,0.4)',
          borderRadius:16, padding:'40px 44px',
          boxShadow:'0 0 80px rgba(124,58,237,0.2)'
        }}>
          <p style={{color:'#4b5563',fontSize:11,marginBottom:20,letterSpacing:2}}>NEXUS v2 — BOOT SEQUENCE</p>
          {bootLines.map((line, i) => (
            <BootLine key={i} text={line} delay={i * 380} isLast={i === bootLines.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function BootLine({ text, delay, isLast }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  if (!visible) return null
  return (
    <div style={{
      animation:'bootIn 0.3s ease forwards',
      color: isLast ? '#34d399' : '#7c3aed',
      fontSize:13, marginBottom:10,
      display:'flex', alignItems:'center', gap:8
    }}>
      {text}
      {isLast && <span style={{animation:'blink 1s infinite',color:'#34d399'}}>█</span>}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  return user
    ? <Dashboard user={user} onSignOut={() => setUser(null)} />
    : <LoginPage onLogin={setUser} />
}