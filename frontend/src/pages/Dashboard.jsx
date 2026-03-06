import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import LeadDetail from '../components/LeadDetail'
import SignalFeed from '../components/SignalFeed'
import SafetyMeters from '../components/SafetyMeters'
import PersonaPreview from '../components/PersonaPreview'
import LeadUpload from '../components/LeadUpload'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const API = 'http://localhost:8000/api'

const MOCK_LEADS = [
  { id:'1', name:'Rahul Sharma', company:'TechCorp', role:'CTO', persona:'dev', status:'sent', score:74,
    email:'rahul@techcorp.com', industry:'Technology',
    pain_points:['Scaling infrastructure fast','Accumulating technical debt','Engineering team velocity dropping'],
    hook:'TechCorp is hiring 12 backend engineers — classic scaling inflection point.',
    approach:'Lead with an engineering benchmark stat on how AI outreach cuts hiring cycles by 40%.' },
  { id:'2', name:'Priya Mehta', company:'StartupXYZ', role:'HR Manager', persona:'priya', status:'opened', score:61,
    email:'priya@startupxyz.com', industry:'HR Tech',
    pain_points:['Manual candidate outreach taking 3+ hours/day','Poor coordination across hiring teams','No visibility into outreach performance'],
    hook:'StartupXYZ doubled headcount in 6 months — HR ops at breaking point?',
    approach:'Lead with time savings. Priya wants empathy, not pressure.' },
  { id:'3', name:'Arjun Singh', company:'ScaleUp Inc', role:'CEO', persona:'arjun', status:'replied', score:82,
    email:'arjun@scaleup.com', industry:'SaaS',
    pain_points:['Revenue growth has plateaued at $2M ARR','Sales team sending generic cold emails','Losing deals to faster competitors'],
    hook:'ScaleUp raised Series A 3 months ago — why is outreach still manual?',
    approach:'Lead with revenue impact. Arjun responds to urgency and ROI.' },
  { id:'4', name:'Neha Kapoor', company:'FinFlow', role:'VP Sales', persona:'arjun', status:'pending', score:68,
    email:'neha@finflow.com', industry:'Fintech',
    pain_points:['Pipeline visibility is poor','Cold outreach conversion under 2%','Follow-up consistency is a mess'],
    hook:'FinFlow expanding to 3 new markets — sales stack keeping up?',
    approach:'Lead with pipeline conversion benchmarks. VPs of Sales love numbers.' },
  { id:'5', name:'Vikram Iyer', company:'DataLens', role:'CTO', persona:'dev', status:'sent', score:79,
    email:'vikram@datalens.com', industry:'Data',
    pain_points:['Data pipeline reliability issues','Engineering hiring taking too long','Tech debt accumulating fast'],
    hook:'DataLens processing 10TB/day — still doing outreach on spreadsheets?',
    approach:'Lead with engineering productivity metrics and a specific stat.' },
]

const TREND = [
  {d:'Mon',r:2,s:8},{d:'Tue',r:3,s:10},{d:'Wed',r:1,s:6},
  {d:'Thu',r:5,s:12},{d:'Fri',r:4,s:9},{d:'Sat',r:6,s:14},{d:'Sun',r:8,s:15},
]

const FUNNEL = [
  {s:'Upload',n:50},{s:'Enrich',n:50},{s:'Send',n:38},
  {s:'Open',n:22},{s:'Click',n:11},{s:'Reply',n:6},
]

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let current = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return val
}

const PC = {
  arjun: { bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.3)', text:'#f87171', label:'🔴 Arjun' },
  priya: { bg:'rgba(234,179,8,0.1)', border:'rgba(234,179,8,0.3)', text:'#fbbf24', label:'🟡 Priya' },
  dev:   { bg:'rgba(6,182,212,0.1)', border:'rgba(6,182,212,0.3)', text:'#22d3ee', label:'🔵 Dev' },
}
const SC = {
  replied: { c:'#22c55e', bg:'rgba(34,197,94,0.1)', b:'rgba(34,197,94,0.3)' },
  opened:  { c:'#06b6d4', bg:'rgba(6,182,212,0.1)', b:'rgba(6,182,212,0.3)' },
  sent:    { c:'#a855f7', bg:'rgba(168,85,247,0.1)', b:'rgba(168,85,247,0.3)' },
  pending: { c:'#6b7280', bg:'rgba(107,114,128,0.08)', b:'rgba(107,114,128,0.2)' },
}

const NAV = [
  { id:'overview', icon:'⚡', label:'Dashboard' },
  { id:'leads',    icon:'👥', label:'Leads' },
  { id:'upload',   icon:'📤', label:'Upload' },
  { id:'mirror',   icon:'🪞', label:'Mirror AI' },
  { id:'personas', icon:'👤', label:'Personas' },
  { id:'signals',  icon:'📡', label:'Signals' },
]

const CARD = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(168,85,247,0.12)',
  borderRadius: 16,
  backdropFilter: 'blur(10px)',
}

export default function Dashboard({ user, onSignOut }) {
  const [page, setPage] = useState('overview')
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(MOCK_LEADS[0])
  const [time, setTime] = useState(new Date())
  const [stats, setStats] = useState({ total:50, sent:38, replied:6, avg_score:74 })

  const total    = useCountUp(stats.total)
  const sent     = useCountUp(stats.sent)
  const replied  = useCountUp(stats.replied)
  const avgScore = useCountUp(stats.avg_score)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    axios.get(`${API}/leads/all`).then(r => { if (r.data?.length) setLeads(r.data) }).catch(() => {})
    axios.get(`${API}/dashboard/stats`).then(r => setStats(r.data)).catch(() => {})
  }, [])

  const STATS = [
    { label:'TOTAL LEADS',  value:total,    icon:'👥', color:'#a855f7', glow:'rgba(168,85,247,0.3)', sub:`+${Math.floor(total*0.24)} today` },
    { label:'EMAILS SENT',  value:sent,     icon:'✉️', color:'#06b6d4', glow:'rgba(6,182,212,0.3)',  sub:'via SendGrid' },
    { label:'REPLIED',      value:replied,  icon:'↩️', color:'#22c55e', glow:'rgba(34,197,94,0.3)',  sub:'15.8% rate' },
    { label:'AVG MIRROR',   value:avgScore, icon:'🪞', color:'#f59e0b', glow:'rgba(245,158,11,0.3)', sub:'/ 100 score' },
  ]

  const scoreColor = s => s >= 70 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ minHeight:'100vh', background:'#050508', color:'#f8fafc', display:'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes glow   { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .nav-item { transition: all 0.15s ease; cursor: pointer; }
        .nav-item:hover { background: rgba(168,85,247,0.1) !important; color: #c084fc !important; }
        .lead-row { transition: background 0.15s ease; cursor: pointer; }
        .lead-row:hover { background: rgba(168,85,247,0.06) !important; }
        .stat-card { transition: transform 0.2s ease; cursor: default; }
        .stat-card:hover { transform: translateY(-3px); }
        .page-btn { transition: all 0.2s ease; cursor: pointer; }
        .page-btn:hover { color: #c084fc !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: #a855f7; border-radius: 2px; }
        .tooltip-custom { background: #0d0d14 !important; border: 1px solid #a855f7 !important; border-radius: 8px !important; font-family: 'JetBrains Mono' !important; font-size: 11px !important; }
      `}</style>

      {/* ─── SIDEBAR ─── */}
      <div style={{
        width: 220, background: '#0a0a0f',
        borderRight: '1px solid rgba(168,85,247,0.1)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding:'24px 20px', borderBottom:'1px solid rgba(168,85,247,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:22, filter:'drop-shadow(0 0 12px rgba(168,85,247,0.9))' }}>⚡</span>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800,
              background:'linear-gradient(135deg,#e9d5ff,#a855f7)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:-1 }}>
              NEXUS
            </span>
          </div>
          <p style={{ color:'#1f2937', fontSize:9, letterSpacing:3, marginTop:4 }}>INTELLIGENCE PLATFORM</p>
        </div>

        {/* Nav */}
        <nav style={{ padding:'12px 10px', flex:1 }}>
          {NAV.map(n => (
            <div key={n.id} className='nav-item' onClick={() => setPage(n.id)} style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'11px 12px', borderRadius:10, marginBottom:2,
              background: page===n.id ? 'rgba(168,85,247,0.12)' : 'transparent',
              color: page===n.id ? '#c084fc' : '#4b5563',
              borderLeft: page===n.id ? '2px solid #a855f7' : '2px solid transparent',
              fontWeight: page===n.id ? 600 : 400,
            }}>
              <span style={{ fontSize:15 }}>{n.icon}</span>
              <span style={{ fontSize:12 }}>{n.label}</span>
              {n.id==='signals' && (
                <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%',
                  background:'#22c55e', animation:'pulse 2s infinite' }}/>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'16px 16px', borderTop:'1px solid rgba(168,85,247,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#a855f7,#7c3aed)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:700, color:'white' }}>
              {user?.displayName?.[0] || 'C'}
            </div>
            <div>
              <p style={{ color:'#f8fafc', fontSize:12, fontWeight:600 }}>{user?.displayName || 'Chirag'}</p>
              <p style={{ color:'#374151', fontSize:10 }}>{user?.email || 'Admin'}</p>
            </div>
          </div>
          <button onClick={onSignOut} style={{
            width:'100%', padding:'9px', background:'rgba(239,68,68,0.06)',
            border:'1px solid rgba(239,68,68,0.2)', borderRadius:8,
            color:'#ef4444', fontSize:11, cursor:'pointer', fontFamily:'JetBrains Mono,monospace',
            transition:'all 0.2s',
          }} onMouseEnter={e=>e.target.style.background='rgba(239,68,68,0.12)'}
             onMouseLeave={e=>e.target.style.background='rgba(239,68,68,0.06)'}>
            ↩ Sign Out
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ marginLeft:220, flex:1, display:'flex', flexDirection:'column' }}>

        {/* Topbar */}
        <div style={{
          padding:'14px 32px', borderBottom:'1px solid rgba(168,85,247,0.08)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(5,5,8,0.95)', backdropFilter:'blur(20px)',
          position:'sticky', top:0, zIndex:40,
        }}>
          <div>
            <p style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:'#f8fafc' }}>
              {NAV.find(n => n.id===page)?.label || 'Dashboard'}
            </p>
            <p style={{ color:'#1f2937', fontSize:10, letterSpacing:1, marginTop:2 }}>
              NEXUS v2 &nbsp;// SINGULARITY CLUTCHERS // COHERENCE '26
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <span style={{ color:'#374151', fontSize:11 }}>
              {time.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
            </span>
            <span style={{ color:'#f8fafc', fontSize:15, fontWeight:700, letterSpacing:2 }}>
              {time.toLocaleTimeString()}
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e',
                display:'inline-block', animation:'pulse 2s infinite' }}/>
              <span style={{ color:'#22c55e', fontSize:11, fontWeight:700, letterSpacing:2 }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding:32, flex:1, animation:'fadeIn 0.4s ease' }}>

          {/* ══ OVERVIEW ══ */}
          {page==='overview' && (
            <div>
              {/* Stat Cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                {STATS.map(st => (
                  <div key={st.label} className='stat-card' style={{
                    ...CARD, padding:24, position:'relative', overflow:'hidden',
                    boxShadow:`0 0 28px ${st.glow}`,
                  }}>
                    <div style={{ position:'absolute', top:0, right:0, width:90, height:90,
                      background:`radial-gradient(circle,${st.glow} 0%,transparent 70%)`,
                      filter:'blur(20px)' }}/>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <p style={{ color:'#374151', fontSize:9, letterSpacing:2 }}>{st.label}</p>
                      <span style={{ fontSize:18 }}>{st.icon}</span>
                    </div>
                    <p style={{ color:st.color, fontSize:44, fontWeight:800, fontFamily:'Syne,sans-serif',
                      filter:`drop-shadow(0 0 14px ${st.glow})`, marginBottom:6, lineHeight:1 }}>{st.value}</p>
                    <p style={{ color:'#374151', fontSize:10 }}>{st.sub}</p>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1,
                      background:`linear-gradient(90deg,transparent,${st.color},transparent)`, opacity:0.3 }}/>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                <div style={{ ...CARD, padding:24 }}>
                  <p style={{ color:'#a855f7', fontSize:10, letterSpacing:2, marginBottom:16, fontWeight:700 }}>📈 REPLY TREND — 7 DAYS</p>
                  <ResponsiveContainer width='100%' height={160}>
                    <AreaChart data={TREND}>
                      <defs>
                        <linearGradient id='replyGrad' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#a855f7' stopOpacity={0.4}/>
                          <stop offset='95%' stopColor='#a855f7' stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey='d' stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563',fontFamily:'JetBrains Mono'}}/>
                      <YAxis stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563',fontFamily:'JetBrains Mono'}}/>
                      <Tooltip contentStyle={{background:'#0d0d14',border:'1px solid #a855f7',borderRadius:8,fontFamily:'JetBrains Mono',fontSize:11,color:'#f8fafc'}}/>
                      <Area type='monotone' dataKey='r' stroke='#a855f7' fill='url(#replyGrad)' strokeWidth={2} name='Replies'/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ ...CARD, padding:24 }}>
                  <p style={{ color:'#a855f7', fontSize:10, letterSpacing:2, marginBottom:16, fontWeight:700 }}>📊 OUTREACH FUNNEL</p>
                  <ResponsiveContainer width='100%' height={160}>
                    <BarChart data={FUNNEL}>
                      <XAxis dataKey='s' stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563',fontFamily:'JetBrains Mono'}}/>
                      <YAxis stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563',fontFamily:'JetBrains Mono'}}/>
                      <Tooltip contentStyle={{background:'#0d0d14',border:'1px solid #a855f7',borderRadius:8,fontFamily:'JetBrains Mono',fontSize:11,color:'#f8fafc'}}/>
                      <Bar dataKey='n' fill='#a855f7' radius={[5,5,0,0]} name='Count'/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Signal + Safety */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                <SignalFeed />
                <SafetyMeters />
              </div>
            </div>
          )}

          {/* ══ LEADS ══ */}
          {page==='leads' && (
            <div style={{ ...CARD, overflow:'hidden' }}>
              <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(168,85,247,0.1)',
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ color:'#c084fc', fontSize:12, fontWeight:700, letterSpacing:2 }}>LEAD PIPELINE</p>
                  <p style={{ color:'#374151', fontSize:10, marginTop:3 }}>Click any lead to open full AI profile</p>
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ color:'#a855f7', fontSize:10,
                    border:'1px solid rgba(168,85,247,0.25)', padding:'5px 14px', borderRadius:20 }}>
                    {leads.length} leads
                  </span>
                  <button onClick={() => setPage('upload')} style={{
                    padding:'6px 16px', background:'linear-gradient(135deg,#a855f7,#7c3aed)',
                    border:'none', borderRadius:8, color:'white', fontSize:11,
                    cursor:'pointer', fontFamily:'JetBrains Mono,monospace',
                  }}>+ Upload</button>
                </div>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(168,85,247,0.08)' }}>
                      {['LEAD','COMPANY','ROLE','PERSONA','MIRROR SCORE','STATUS',''].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'12px 20px',
                          color:'#1f2937', fontSize:9, letterSpacing:2, whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => {
                      const pc = PC[lead.persona] || PC.arjun
                      const sc = SC[lead.status] || SC.pending
                      const sc2 = scoreColor(lead.score)
                      return (
                        <tr key={i} className='lead-row' onClick={() => setSelected(lead)}
                          style={{ borderBottom:'1px solid rgba(168,85,247,0.04)' }}>
                          <td style={{ padding:'15px 20px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                              <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0,
                                background:`linear-gradient(135deg,${sc2},rgba(0,0,0,0.6))`,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize:14, fontWeight:700, color:'white', boxShadow:`0 0 10px ${sc2}40` }}>
                                {lead.name[0]}
                              </div>
                              <div>
                                <p style={{ color:'#f8fafc', fontSize:12, fontWeight:600 }}>{lead.name}</p>
                                <p style={{ color:'#374151', fontSize:10, marginTop:1 }}>{lead.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'15px 20px', color:'#6b7280', fontSize:11 }}>{lead.company}</td>
                          <td style={{ padding:'15px 20px', color:'#4b5563', fontSize:10 }}>{lead.role}</td>
                          <td style={{ padding:'15px 20px' }}>
                            <span style={{ background:pc.bg, border:`1px solid ${pc.border}`,
                              color:pc.text, fontSize:10, padding:'4px 10px', borderRadius:20, whiteSpace:'nowrap' }}>
                              {pc.label}
                            </span>
                          </td>
                          <td style={{ padding:'15px 20px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span style={{ color:sc2, fontWeight:700, fontSize:18, minWidth:28,
                                filter:`drop-shadow(0 0 6px ${sc2})` }}>{lead.score}</span>
                              <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.04)',
                                borderRadius:2, minWidth:50, overflow:'hidden' }}>
                                <div style={{ width:`${lead.score}%`, height:'100%',
                                  background:`linear-gradient(90deg,${sc2},${sc2}aa)`,
                                  borderRadius:2, boxShadow:`0 0 8px ${sc2}` }}/>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'15px 20px' }}>
                            <span style={{ background:sc.bg, border:`1px solid ${sc.b}`,
                              color:sc.c, fontSize:9, padding:'5px 12px', borderRadius:20,
                              textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>
                              ● {lead.status}
                            </span>
                          </td>
                          <td style={{ padding:'15px 20px' }}>
                            <span style={{ color:'#374151', fontSize:18 }}>›</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ UPLOAD ══ */}
          {page==='upload' && (
            <LeadUpload
              onLeadsLoaded={newLeads => { setLeads(newLeads); setPage('leads') }}
            />
          )}

          {/* ══ MIRROR ══ */}
          {page==='mirror' && (
            <div>
              <p style={{ color:'#c084fc', fontSize:12, letterSpacing:2, marginBottom:20, fontWeight:700 }}>
                🪞 SELECT A LEAD — THEN OPEN EMAIL TAB TO RUN MIRROR
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                {leads.map(l => (
                  <div key={l.id} onClick={() => { setSelected(l) }} style={{
                    ...CARD, padding:20, cursor:'pointer', transition:'all 0.2s',
                    border:`1px solid ${selected?.id===l.id ? 'rgba(168,85,247,0.5)' : 'rgba(168,85,247,0.1)'}`,
                    boxShadow: selected?.id===l.id ? '0 0 20px rgba(168,85,247,0.2)' : 'none',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%',
                        background:`linear-gradient(135deg,${scoreColor(l.score)},rgba(0,0,0,0.5))`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:14, fontWeight:700, color:'white' }}>{l.name[0]}</div>
                      <div>
                        <p style={{ color:'#f8fafc', fontSize:12, fontWeight:600 }}>{l.name}</p>
                        <p style={{ color:'#4b5563', fontSize:10 }}>{l.role}</p>
                      </div>
                    </div>
                    <p style={{ color:'#374151', fontSize:10, marginBottom:8 }}>{l.company}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:scoreColor(l.score), fontSize:20, fontWeight:700,
                        filter:`drop-shadow(0 0 6px ${scoreColor(l.score)})` }}>{l.score}</span>
                      <span style={{ color:'#374151', fontSize:10 }}>mirror score</span>
                    </div>
                  </div>
                ))}
              </div>
              {selected && (
                <div style={{ marginTop:16, padding:14,
                  background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)',
                  borderRadius:10 }}>
                  <p style={{ color:'#22c55e', fontSize:11 }}>
                    ✓ {selected.name} selected — panel opening. Click Email tab → Generate → Mirror Check.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ══ PERSONAS ══ */}
          {page==='personas' && (
            <div>
              <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
                {leads.map(l => (
                  <button key={l.id} onClick={() => setPreview(l)} style={{
                    padding:'9px 20px', borderRadius:8, border:'none', cursor:'pointer',
                    background: preview?.id===l.id ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'rgba(13,13,20,0.9)',
                    color: preview?.id===l.id ? 'white' : '#4b5563',
                    fontFamily:'JetBrains Mono,monospace', fontSize:11,
                    outline: preview?.id===l.id ? 'none' : '1px solid rgba(168,85,247,0.15)',
                    boxShadow: preview?.id===l.id ? '0 0 20px rgba(168,85,247,0.4)' : 'none',
                    transition:'all 0.2s',
                  }}>{l.name}</button>
                ))}
              </div>
              {preview && <PersonaPreview lead={preview} />}
            </div>
          )}

          {/* ══ SIGNALS ══ */}
          {page==='signals' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <SignalFeed />
              <SafetyMeters />
            </div>
          )}

        </div>
      </div>

      {selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}