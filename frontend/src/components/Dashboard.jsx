import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import LeadDetail from '../components/LeadDetail'
import SignalFeed from '../components/SignalFeed'
import SafetyMeters from '../components/SafetyMeters'
import PersonaPreview from '../components/PersonaPreview'
import LeadUpload from '../components/LeadUpload'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const API = 'http://localhost:8000/api'

const MOCK_LEADS = [
  { id:'1', name:'Rahul Sharma', company:'TechCorp', role:'CTO', persona:'dev',
    status:'replied', score:82, email:'rahul@techcorp.com', industry:'Technology',
    pain_points:['Engineering team scaling too fast','Technical debt accumulating','Outreach pipeline broken'],
    hook:'TechCorp hiring 12 engineers — classic scaling inflection point.',
    approach:'Lead with engineering benchmark stat on hiring cycles' },
  { id:'2', name:'Priya Mehta', company:'StartupXYZ', role:'HR Manager', persona:'priya',
    status:'opened', score:61, email:'priya@startupxyz.com', industry:'HR Tech',
    pain_points:['3+ hours/day on manual outreach','No visibility into follow-up performance','Team coordination gaps'],
    hook:'StartupXYZ doubled headcount — HR ops at breaking point?',
    approach:'Lead with time savings and emotional relief' },
  { id:'3', name:'Arjun Singh', company:'ScaleUp Inc', role:'CEO', persona:'arjun',
    status:'replied', score:88, email:'arjun@scaleup.com', industry:'SaaS',
    pain_points:['Revenue plateaued at $2M ARR','Generic outreach getting ignored','Losing deals to faster competitors'],
    hook:'ScaleUp raised Series A 3 months ago — outreach still manual?',
    approach:'Lead with revenue impact and urgency' },
  { id:'4', name:'Neha Kapoor', company:'FinFlow', role:'VP Sales', persona:'arjun',
    status:'sent', score:71, email:'neha@finflow.com', industry:'Fintech',
    pain_points:['Cold outreach conversion under 2%','Pipeline visibility is poor','Inconsistent follow-up'],
    hook:'FinFlow expanding to 3 markets — sales stack ready?',
    approach:'Lead with pipeline conversion benchmarks' },
  { id:'5', name:'Vikram Iyer', company:'DataLens', role:'CTO', persona:'dev',
    status:'sent', score:76, email:'vikram@datalens.com', industry:'Data',
    pain_points:['10TB/day pipeline with no smart routing','Engineering hiring slow','Tech debt growing'],
    hook:'DataLens at 10TB/day — outreach still on spreadsheets?',
    approach:'Lead with engineering productivity metrics' },
  { id:'6', name:'Ananya Rao', company:'GrowthOS', role:'Head of Growth', persona:'arjun',
    status:'pending', score:55, email:'ananya@growthos.com', industry:'SaaS',
    pain_points:['CAC too high','Outbound not converting','Attribution unclear'],
    hook:'GrowthOS Series B — is outbound keeping up with paid?',
    approach:'Lead with CAC reduction stat' },
]

const TREND = [
  {d:'Mon',r:2,s:8,o:5},{d:'Tue',r:3,s:10,o:7},{d:'Wed',r:1,s:6,o:3},
  {d:'Thu',r:5,s:12,o:9},{d:'Fri',r:4,s:9,o:6},{d:'Sat',r:6,s:14,o:11},{d:'Sun',r:8,s:15,o:13},
]
const FUNNEL_DATA = [
  {s:'Uploaded',n:50,fill:'#a855f7'},{s:'Enriched',n:50,fill:'#9333ea'},
  {s:'Sent',n:38,fill:'#7c3aed'},{s:'Opened',n:22,fill:'#6d28d9'},
  {s:'Clicked',n:11,fill:'#5b21b6'},{s:'Replied',n:8,fill:'#22c55e'},
]
const PERSONA_DIST = [
  { name:'Dev (Analyst)', value:18, color:'#06b6d4' },
  { name:'Arjun (Closer)', value:20, color:'#ef4444' },
  { name:'Priya (Nurturer)', value:12, color:'#f59e0b' },
]

function useCountUp(target, duration=1000) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let cur = 0
    const step = target / (duration / 16)
    const t = setInterval(() => {
      cur = Math.min(cur + step, target)
      setVal(Math.floor(cur))
      if (cur >= target) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return val
}

const PC = {
  arjun: { bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.25)', text:'#f87171', dot:'#ef4444', label:'Arjun' },
  priya: { bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.25)', text:'#fbbf24', dot:'#f59e0b', label:'Priya' },
  dev:   { bg:'rgba(6,182,212,0.08)',  border:'rgba(6,182,212,0.25)',  text:'#22d3ee', dot:'#06b6d4', label:'Dev' },
}
const SC = {
  replied: { c:'#22c55e', bg:'rgba(34,197,94,0.08)',   b:'rgba(34,197,94,0.2)' },
  opened:  { c:'#06b6d4', bg:'rgba(6,182,212,0.08)',   b:'rgba(6,182,212,0.2)' },
  sent:    { c:'#a855f7', bg:'rgba(168,85,247,0.08)',  b:'rgba(168,85,247,0.2)' },
  pending: { c:'#6b7280', bg:'rgba(107,114,128,0.05)', b:'rgba(107,114,128,0.15)' },
}
const scoreColor = s => s>=80?'#22c55e':s>=65?'#06b6d4':s>=50?'#f59e0b':'#ef4444'

const NAV = [
  { id:'overview',  icon:'▣',  label:'Overview' },
  { id:'leads',     icon:'◈',  label:'Leads' },
  { id:'upload',    icon:'↑',  label:'Upload' },
  { id:'mirror',    icon:'◎',  label:'Mirror AI' },
  { id:'personas',  icon:'◐',  label:'Personas' },
  { id:'analytics', icon:'⋯',  label:'Analytics' },
  { id:'sequence',  icon:'⟳',  label:'Sequences' },
  { id:'signals',   icon:'◉',  label:'Signals' },
]

// ── Shared card style
const card = (extra={}) => ({
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  backdropFilter: 'blur(8px)',
  ...extra,
})

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#111827', border:'1px solid rgba(168,85,247,0.3)',
      borderRadius:8, padding:'8px 12px', fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>
      <p style={{ color:'#9ca3af', marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color||'#a855f7' }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard({ user, onSignOut }) {
  const [page, setPage] = useState('overview')
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(MOCK_LEADS[0])
  const [time, setTime] = useState(new Date())
  const [stats, setStats] = useState({ total:50, sent:38, replied:8, avg_score:74 })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const total    = useCountUp(stats.total)
  const sent     = useCountUp(stats.sent)
  const replied  = useCountUp(stats.replied)
  const avgScore = useCountUp(stats.avg_score)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    axios.get(`${API}/leads/all`).then(r => { if (r.data?.length) setLeads(r.data) }).catch(()=>{})
    axios.get(`${API}/dashboard/stats`).then(r => setStats(r.data)).catch(()=>{})
  }, [])

  const STATS = [
    { label:'Total Leads',    value:total,    unit:'',    color:'#a855f7', glow:'rgba(168,85,247,0.15)', change:'+12 today',  icon:'◈' },
    { label:'Emails Sent',    value:sent,     unit:'',    color:'#06b6d4', glow:'rgba(6,182,212,0.15)',  change:'via SendGrid', icon:'✉' },
    { label:'Replied',        value:replied,  unit:'',    color:'#22c55e', glow:'rgba(34,197,94,0.15)',  change:'16% rate',   icon:'↩' },
    { label:'Avg Mirror Score',value:avgScore,unit:'/100',color:'#f59e0b', glow:'rgba(245,158,11,0.15)', change:'↑ +3 pts',  icon:'◎' },
  ]

  const sideW = sidebarCollapsed ? 64 : 220

  return (
    <div style={{ minHeight:'100vh', background:'#080b11', color:'#e2e8f0', display:'flex', fontFamily:'JetBrains Mono, monospace' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#080b11; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes shimmer  { 0%{background-position:-200%} 100%{background-position:200%} }
        .nav-item { cursor:pointer; transition:all 0.15s ease; }
        .nav-item:hover { background:rgba(255,255,255,0.05) !important; color:#e2e8f0 !important; }
        .nav-active { background:rgba(168,85,247,0.12) !important; color:#c084fc !important; border-left:2px solid #a855f7 !important; }
        .lead-row { transition:background 0.1s ease; cursor:pointer; }
        .lead-row:hover { background:rgba(168,85,247,0.04) !important; }
        .stat-card { transition:transform 0.2s ease,box-shadow 0.2s ease; }
        .stat-card:hover { transform:translateY(-2px); }
        .btn-primary { cursor:pointer; transition:all 0.2s ease; }
        .btn-primary:hover { opacity:0.85; transform:translateY(-1px); }
        .btn-ghost { cursor:pointer; transition:all 0.15s ease; background:transparent; border:1px solid rgba(255,255,255,0.08); color:#6b7280; }
        .btn-ghost:hover { border-color:rgba(168,85,247,0.4); color:#a855f7; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(168,85,247,0.3); border-radius:3px; }
        .page-anim { animation:fadeUp 0.3s ease; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{
        width:sideW, background:'#0d1117', borderRight:'1px solid rgba(255,255,255,0.05)',
        display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, zIndex:50,
        transition:'width 0.2s ease', overflow:'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)',
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, overflow:'hidden' }}>
            <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#a855f7,#7c3aed)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0,
              boxShadow:'0 0 16px rgba(168,85,247,0.4)' }}>⚡</div>
            {!sidebarCollapsed && (
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:16, fontWeight:800,
                color:'#f8fafc', letterSpacing:-0.5, whiteSpace:'nowrap' }}>NEXUS</span>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed(c=>!c)} style={{
            background:'none', border:'none', color:'#374151', cursor:'pointer', fontSize:14,
            flexShrink:0, padding:4
          }}>{sidebarCollapsed ? '›' : '‹'}</button>
        </div>

        {/* Nav items */}
        <nav style={{ padding:'10px 8px', flex:1, overflowY:'auto' }}>
          {NAV.map(n => (
            <div key={n.id} onClick={() => setPage(n.id)}
              className={`nav-item ${page===n.id?'nav-active':''}`}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
                borderRadius:8, marginBottom:1, color:'#4b5563',
                borderLeft: page===n.id ? '2px solid #a855f7' : '2px solid transparent',
                fontWeight: page===n.id ? 600 : 400 }}>
              <span style={{ fontSize:15, flexShrink:0, fontFamily:'monospace', minWidth:18, textAlign:'center' }}>
                {n.icon}
              </span>
              {!sidebarCollapsed && (
                <span style={{ fontSize:12, whiteSpace:'nowrap' }}>{n.label}</span>
              )}
              {!sidebarCollapsed && n.id==='signals' && (
                <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%',
                  background:'#22c55e', flexShrink:0, animation:'pulse 2s infinite' }}/>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#a855f7,#7c3aed)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, color:'white' }}>
              {user?.displayName?.[0]||'C'}
            </div>
            {!sidebarCollapsed && (
              <div style={{ flex:1, overflow:'hidden' }}>
                <p style={{ color:'#e2e8f0', fontSize:11, fontWeight:600, truncate:true, whiteSpace:'nowrap' }}>
                  {user?.displayName||'Chirag'}
                </p>
                <button onClick={onSignOut} style={{
                  background:'none', border:'none', color:'#4b5563', fontSize:10,
                  cursor:'pointer', fontFamily:'JetBrains Mono,monospace', padding:0
                }}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ marginLeft:sideW, flex:1, display:'flex', flexDirection:'column', transition:'margin-left 0.2s ease' }}>

        {/* Topbar */}
        <div style={{ padding:'12px 28px', borderBottom:'1px solid rgba(255,255,255,0.05)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(8,11,17,0.9)', backdropFilter:'blur(20px)',
          position:'sticky', top:0, zIndex:40 }}>
          <div>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:16, fontWeight:700, color:'#f8fafc' }}>
              {NAV.find(n=>n.id===page)?.label || 'Dashboard'}
            </p>
            <p style={{ color:'#374151', fontSize:10, letterSpacing:0.5, marginTop:1 }}>
              NEXUS v2 &nbsp;·&nbsp; Singularity Clutchers &nbsp;·&nbsp; COHERENCE '26
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <span style={{ color:'#374151', fontSize:11 }}>
              {time.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
            </span>
            <span style={{ color:'#6b7280', fontSize:13, fontWeight:600, letterSpacing:1 }}>
              {time.toLocaleTimeString()}
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e',
                display:'inline-block', animation:'pulse 2s infinite' }}/>
              <span style={{ color:'#22c55e', fontSize:10, fontWeight:700, letterSpacing:2 }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'24px 28px', flex:1, overflowY:'auto' }} className='page-anim' key={page}>

          {/* ══ OVERVIEW ══ */}
          {page==='overview' && (
            <div>
              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
                {STATS.map(st => (
                  <div key={st.label} className='stat-card' style={{ ...card({ padding:20, position:'relative', overflow:'hidden',
                    boxShadow:`0 0 24px ${st.glow}` }) }}>
                    <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80,
                      background:`radial-gradient(circle,${st.glow} 0%,transparent 70%)`, filter:'blur(20px)' }}/>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <p style={{ color:'#4b5563', fontSize:10, letterSpacing:1 }}>{st.label.toUpperCase()}</p>
                      <span style={{ color:st.color, fontSize:16, opacity:0.7 }}>{st.icon}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:6 }}>
                      <span style={{ color:st.color, fontSize:36, fontWeight:700, fontFamily:'Inter,sans-serif',
                        filter:`drop-shadow(0 0 10px ${st.glow})` }}>{st.value}</span>
                      {st.unit && <span style={{ color:'#374151', fontSize:13 }}>{st.unit}</span>}
                    </div>
                    <p style={{ color:'#374151', fontSize:10 }}>{st.change}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginBottom:14 }}>
                <div style={{ ...card({ padding:20 }) }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <p style={{ color:'#9ca3af', fontSize:11, fontWeight:600, letterSpacing:1 }}>OUTREACH PERFORMANCE</p>
                    <span style={{ color:'#374151', fontSize:10 }}>Last 7 days</span>
                  </div>
                  <ResponsiveContainer width='100%' height={180}>
                    <AreaChart data={TREND}>
                      <defs>
                        <linearGradient id='gR' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#22c55e' stopOpacity={0.2}/>
                          <stop offset='95%' stopColor='#22c55e' stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id='gS' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#a855f7' stopOpacity={0.15}/>
                          <stop offset='95%' stopColor='#a855f7' stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey='d' stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563'}}/>
                      <YAxis stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563'}}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Area type='monotone' dataKey='s' name='Sent' stroke='#a855f7' fill='url(#gS)' strokeWidth={1.5}/>
                      <Area type='monotone' dataKey='o' name='Opened' stroke='#06b6d4' fill='none' strokeWidth={1.5} strokeDasharray='4 2'/>
                      <Area type='monotone' dataKey='r' name='Replied' stroke='#22c55e' fill='url(#gR)' strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ ...card({ padding:20 }) }}>
                  <p style={{ color:'#9ca3af', fontSize:11, fontWeight:600, letterSpacing:1, marginBottom:16 }}>PERSONA MIX</p>
                  <ResponsiveContainer width='100%' height={140}>
                    <PieChart>
                      <Pie data={PERSONA_DIST} cx='50%' cy='50%' innerRadius={40} outerRadius={60} paddingAngle={3} dataKey='value'>
                        {PERSONA_DIST.map((e,i) => <Cell key={i} fill={e.color}/>)}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {PERSONA_DIST.map(p => (
                      <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:p.color, flexShrink:0 }}/>
                        <span style={{ color:'#6b7280', fontSize:10 }}>{p.name}</span>
                        <span style={{ color:p.color, fontSize:10, marginLeft:'auto', fontWeight:600 }}>{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Funnel + Signal + Safety */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                <div style={{ ...card({ padding:20 }) }}>
                  <p style={{ color:'#9ca3af', fontSize:11, fontWeight:600, letterSpacing:1, marginBottom:16 }}>FUNNEL</p>
                  <ResponsiveContainer width='100%' height={160}>
                    <BarChart data={FUNNEL_DATA} layout='vertical'>
                      <XAxis type='number' stroke='#1f2937' fontSize={9} tick={{fill:'#4b5563'}}/>
                      <YAxis type='category' dataKey='s' stroke='#1f2937' fontSize={9} tick={{fill:'#4b5563'}} width={48}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey='n' name='Count' radius={[0,3,3,0]}>
                        {FUNNEL_DATA.map((e,i) => <Cell key={i} fill={e.fill}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <SignalFeed />
                <SafetyMeters />
              </div>
            </div>
          )}

          {/* ══ LEADS ══ */}
          {page==='leads' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <p style={{ color:'#e2e8f0', fontSize:15, fontFamily:'Inter,sans-serif', fontWeight:600 }}>Lead Pipeline</p>
                  <p style={{ color:'#374151', fontSize:11, marginTop:2 }}>{leads.length} leads enriched · click any row to open full AI profile</p>
                </div>
                <button className='btn-primary' onClick={() => setPage('upload')} style={{
                  padding:'8px 18px', background:'linear-gradient(135deg,#a855f7,#7c3aed)',
                  border:'none', borderRadius:8, color:'white', fontSize:12, fontWeight:600,
                  fontFamily:'JetBrains Mono,monospace' }}>+ Upload Leads</button>
              </div>
              <div style={{ ...card({ overflow:'hidden' }) }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      {['Lead','Company','Role','Persona','Score','Status',''].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'10px 16px',
                          color:'#374151', fontSize:9, letterSpacing:1.5, fontWeight:600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead,i) => {
                      const pc = PC[lead.persona]||PC.arjun
                      const sc = SC[lead.status]||SC.pending
                      const sc2 = scoreColor(lead.score)
                      return (
                        <tr key={i} className='lead-row' onClick={() => setSelected(lead)}
                          style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding:'13px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0,
                                background:`linear-gradient(135deg,${sc2}33,${sc2}11)`,
                                border:`1px solid ${sc2}33`,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize:12, fontWeight:700, color:sc2 }}>
                                {lead.name[0]}
                              </div>
                              <div>
                                <p style={{ color:'#e2e8f0', fontSize:12, fontWeight:500 }}>{lead.name}</p>
                                <p style={{ color:'#374151', fontSize:10, marginTop:1 }}>{lead.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'13px 16px', color:'#6b7280', fontSize:11 }}>{lead.company}</td>
                          <td style={{ padding:'13px 16px', color:'#4b5563', fontSize:10 }}>{lead.role}</td>
                          <td style={{ padding:'13px 16px' }}>
                            <span style={{ background:pc.bg, border:`1px solid ${pc.border}`,
                              color:pc.text, fontSize:10, padding:'3px 9px', borderRadius:20, display:'inline-flex', alignItems:'center', gap:5 }}>
                              <span style={{ width:5, height:5, borderRadius:'50%', background:pc.dot }}/>
                              {pc.label}
                            </span>
                          </td>
                          <td style={{ padding:'13px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span style={{ color:sc2, fontWeight:700, fontSize:15, minWidth:26 }}>{lead.score}</span>
                              <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.04)', borderRadius:2, minWidth:40 }}>
                                <div style={{ width:`${lead.score}%`, height:'100%', background:sc2,
                                  borderRadius:2, opacity:0.8 }}/>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:'13px 16px' }}>
                            <span style={{ background:sc.bg, border:`1px solid ${sc.b}`,
                              color:sc.c, fontSize:9, padding:'3px 9px', borderRadius:20,
                              textTransform:'uppercase', letterSpacing:1 }}>
                              {lead.status}
                            </span>
                          </td>
                          <td style={{ padding:'13px 16px', color:'#374151' }}>›</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ UPLOAD ══ */}
          {page==='upload' && <LeadUpload onLeadsLoaded={l => { setLeads(l); setPage('leads') }}/>}

          {/* ══ MIRROR ══ */}
          {page==='mirror' && (
            <div>
              <div style={{ marginBottom:20 }}>
                <p style={{ color:'#e2e8f0', fontSize:15, fontFamily:'Inter,sans-serif', fontWeight:600 }}>Mirror AI</p>
                <p style={{ color:'#374151', fontSize:11, marginTop:2 }}>
                  Select a lead → open their panel → Email tab → Generate → Mirror Check
                </p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {leads.map(l => (
                  <div key={l.id} onClick={() => setSelected(l)} style={{
                    ...card({ padding:18, cursor:'pointer', transition:'all 0.2s',
                      border:`1px solid ${selected?.id===l.id ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.05)'}`,
                      boxShadow: selected?.id===l.id ? '0 0 20px rgba(168,85,247,0.1)' : 'none' }) }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%',
                        background:`linear-gradient(135deg,${scoreColor(l.score)}22,${scoreColor(l.score)}08)`,
                        border:`1px solid ${scoreColor(l.score)}33`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:scoreColor(l.score), fontWeight:700, fontSize:13 }}>{l.name[0]}</div>
                      <div>
                        <p style={{ color:'#e2e8f0', fontSize:12, fontWeight:500 }}>{l.name}</p>
                        <p style={{ color:'#4b5563', fontSize:10 }}>{l.role} · {l.company}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ color:scoreColor(l.score), fontSize:20, fontWeight:700 }}>{l.score}</span>
                      <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.04)', borderRadius:2 }}>
                        <div style={{ width:`${l.score}%`, height:'100%', background:scoreColor(l.score), borderRadius:2 }}/>
                      </div>
                    </div>
                    {l.hook && <p style={{ color:'#374151', fontSize:10, marginTop:8, lineHeight:1.4 }}>{l.hook}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PERSONAS ══ */}
          {page==='personas' && (
            <div>
              <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
                {leads.map(l => (
                  <button key={l.id} onClick={() => setPreview(l)} className='btn-ghost' style={{
                    padding:'7px 16px', borderRadius:8, fontSize:11, fontFamily:'JetBrains Mono,monospace',
                    background: preview?.id===l.id ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'transparent',
                    border: preview?.id===l.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: preview?.id===l.id ? 'white' : '#6b7280',
                    boxShadow: preview?.id===l.id ? '0 0 16px rgba(168,85,247,0.3)' : 'none',
                  }}>{l.name}</button>
                ))}
              </div>
              {preview && <PersonaPreview lead={preview} />}
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {page==='analytics' && <AnalyticsPage leads={leads}/>}

          {/* ══ SEQUENCE ══ */}
          {page==='sequence' && <SequencePage leads={leads}/>}

          {/* ══ SIGNALS ══ */}
          {page==='signals' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <SignalFeed/>
              <SafetyMeters/>
            </div>
          )}
        </div>
      </div>

      {selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

// ════════════════════════════════════════════
// ANALYTICS PAGE
// ════════════════════════════════════════════
function AnalyticsPage({ leads }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'#111827', border:'1px solid rgba(168,85,247,0.3)',
        borderRadius:8, padding:'8px 12px', fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>
        <p style={{ color:'#9ca3af', marginBottom:4 }}>{label}</p>
        {payload.map((p,i) => (
          <p key={i} style={{ color:p.color||'#a855f7' }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }

  const industryData = leads.reduce((acc, l) => {
    const ex = acc.find(a => a.industry===l.industry)
    if (ex) ex.count++; else acc.push({industry:l.industry||'Other', count:1, score:l.score})
    return acc
  }, [])

  const scoreData = [
    { range:'80-100', count:leads.filter(l=>l.score>=80).length, label:'High', color:'#22c55e' },
    { range:'65-79',  count:leads.filter(l=>l.score>=65&&l.score<80).length, label:'Good', color:'#06b6d4' },
    { range:'50-64',  count:leads.filter(l=>l.score>=50&&l.score<65).length, label:'Avg',  color:'#f59e0b' },
    { range:'0-49',   count:leads.filter(l=>l.score<50).length, label:'Low',  color:'#ef4444' },
  ]

  return (
    <div className='page-anim'>
      <div style={{ marginBottom:20 }}>
        <p style={{ color:'#e2e8f0', fontSize:15, fontFamily:'Inter,sans-serif', fontWeight:600 }}>Analytics</p>
        <p style={{ color:'#374151', fontSize:11, marginTop:2 }}>Performance metrics across all campaigns</p>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[
          { label:'Open Rate',    value:'57.9%', sub:'22 of 38 opened',  color:'#06b6d4' },
          { label:'Reply Rate',   value:'21.1%', sub:'8 of 38 replied',  color:'#22c55e' },
          { label:'Click Rate',   value:'28.9%', sub:'11 of 38 clicked', color:'#a855f7' },
          { label:'Bounce Rate',  value:'2.1%',  sub:'Within safe limits', color:'#f59e0b' },
        ].map(k => (
          <div key={k.label} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:12, padding:18 }}>
            <p style={{ color:'#4b5563', fontSize:10, letterSpacing:1, marginBottom:8 }}>{k.label.toUpperCase()}</p>
            <p style={{ color:k.color, fontSize:28, fontWeight:700, fontFamily:'Inter,sans-serif', marginBottom:4 }}>{k.value}</p>
            <p style={{ color:'#374151', fontSize:10 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        {/* Score distribution */}
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:20 }}>
          <p style={{ color:'#9ca3af', fontSize:11, letterSpacing:1, marginBottom:16, fontWeight:600 }}>MIRROR SCORE DISTRIBUTION</p>
          <ResponsiveContainer width='100%' height={180}>
            <BarChart data={scoreData}>
              <XAxis dataKey='range' stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563'}}/>
              <YAxis stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563'}}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey='count' name='Leads' radius={[4,4,0,0]}>
                {scoreData.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:12, marginTop:8, flexWrap:'wrap' }}>
            {scoreData.map(s => (
              <div key={s.range} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:s.color }}/>
                <span style={{ color:'#4b5563', fontSize:10 }}>{s.label} ({s.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Industry breakdown */}
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:20 }}>
          <p style={{ color:'#9ca3af', fontSize:11, letterSpacing:1, marginBottom:16, fontWeight:600 }}>LEADS BY INDUSTRY</p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {industryData.map((ind,i) => (
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ color:'#9ca3af', fontSize:11 }}>{ind.industry}</span>
                  <span style={{ color:'#6b7280', fontSize:11 }}>{ind.count} leads</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.04)', borderRadius:2 }}>
                  <div style={{ width:`${(ind.count/leads.length)*100}%`, height:'100%',
                    background:'linear-gradient(90deg,#a855f7,#7c3aed)', borderRadius:2 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persona performance */}
      <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:20 }}>
        <p style={{ color:'#9ca3af', fontSize:11, letterSpacing:1, marginBottom:16, fontWeight:600 }}>PERSONA PERFORMANCE</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {[
            { name:'🔵 Dev — The Analyst', sent:18, opened:11, replied:4, color:'#06b6d4', rate:'22%' },
            { name:'🔴 Arjun — The Closer', sent:20, opened:9, replied:3, color:'#ef4444', rate:'15%' },
            { name:'🟡 Priya — The Nurturer', sent:12, opened:8, replied:3, color:'#f59e0b', rate:'25%' },
          ].map(p => (
            <div key={p.name} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)',
              borderRadius:10, padding:16 }}>
              <p style={{ color:p.color, fontSize:11, fontWeight:600, marginBottom:12 }}>{p.name}</p>
              {[['Sent',p.sent],['Opened',p.opened],['Replied',p.replied]].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0',
                  borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ color:'#4b5563', fontSize:10 }}>{k}</span>
                  <span style={{ color:'#9ca3af', fontSize:10, fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:10, textAlign:'center' }}>
                <span style={{ color:p.color, fontSize:18, fontWeight:700 }}>{p.rate}</span>
                <p style={{ color:'#374151', fontSize:9 }}>reply rate</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// SEQUENCE PAGE
// ════════════════════════════════════════════
function SequencePage({ leads }) {
  const [activeSeq, setActiveSeq] = useState(null)

  const SEQUENCES = [
    {
      id:1, name:'SaaS CTO Sequence', status:'active', leads:18, replied:4,
      steps:[
        { day:0,  type:'email',    persona:'dev',   subject:'[Company] engineering outreach rate', action:'Send initial email via Dev persona' },
        { day:3,  type:'check',    persona:null,    subject:'Signal check', action:'If opened → proceed. If cold → LinkedIn fallback' },
        { day:5,  type:'email',    persona:'arjun', subject:'Follow-up: specific offer', action:'Send follow-up via Arjun persona — more direct' },
        { day:8,  type:'linkedin', persona:'dev',   subject:'LinkedIn connection', action:'Send LinkedIn message if email ignored' },
        { day:14, type:'email',    persona:'priya', subject:'Last touch — no pressure', action:'Final email via Priya — warm, low pressure' },
      ]
    },
    {
      id:2, name:'HR Manager Sequence', status:'active', leads:12, replied:3,
      steps:[
        { day:0,  type:'email',    persona:'priya', subject:'Understanding your recruitment flow', action:'Send initial email via Priya persona' },
        { day:4,  type:'check',    persona:null,    subject:'Engagement check', action:'If clicked → book directly. If opened → nurture' },
        { day:7,  type:'email',    persona:'priya', subject:'Team story follow-up', action:'Second touch — share success story' },
        { day:12, type:'linkedin', persona:'priya', subject:'LinkedIn follow-up', action:'LinkedIn message — personal and warm' },
      ]
    },
    {
      id:3, name:'CEO Outbound Sequence', status:'paused', leads:20, replied:5,
      steps:[
        { day:0,  type:'email',    persona:'arjun', subject:'Revenue outreach — direct', action:'Send initial email via Arjun — urgent and specific' },
        { day:2,  type:'check',    persona:null,    subject:'Signal check', action:'Track opens and clicks in real time' },
        { day:5,  type:'email',    persona:'dev',   subject:'Data-backed follow-up', action:'Dev follow-up with benchmark data' },
        { day:9,  type:'linkedin', persona:'arjun', subject:'LinkedIn direct message', action:'Short direct LinkedIn message' },
        { day:14, type:'email',    persona:'priya', subject:'Warm last touch', action:'Final email — acknowledge their time' },
      ]
    },
  ]

  const typeColors = { email:'#a855f7', check:'#06b6d4', linkedin:'#2563eb' }
  const typeIcons  = { email:'✉', check:'◎', linkedin:'in' }

  return (
    <div className='page-anim'>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <p style={{ color:'#e2e8f0', fontSize:15, fontFamily:'Inter,sans-serif', fontWeight:600 }}>Sequences</p>
          <p style={{ color:'#374151', fontSize:11, marginTop:2 }}>Multi-step outreach workflows with smart signal branching</p>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:16 }}>
        {/* Sequence list */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {SEQUENCES.map(seq => (
            <div key={seq.id} onClick={() => setActiveSeq(seq)} style={{
              background:'rgba(255,255,255,0.025)', border:`1px solid ${activeSeq?.id===seq.id?'rgba(168,85,247,0.4)':'rgba(255,255,255,0.05)'}`,
              borderRadius:12, padding:16, cursor:'pointer', transition:'all 0.15s',
              boxShadow: activeSeq?.id===seq.id ? '0 0 16px rgba(168,85,247,0.1)' : 'none',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                <p style={{ color:'#e2e8f0', fontSize:12, fontWeight:500 }}>{seq.name}</p>
                <span style={{
                  fontSize:9, padding:'2px 8px', borderRadius:20, letterSpacing:1,
                  background: seq.status==='active' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                  color: seq.status==='active' ? '#22c55e' : '#6b7280',
                  border: `1px solid ${seq.status==='active' ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)'}`,
                }}>{seq.status.toUpperCase()}</span>
              </div>
              <div style={{ display:'flex', gap:16 }}>
                <div>
                  <p style={{ color:'#6b7280', fontSize:10 }}>Leads</p>
                  <p style={{ color:'#e2e8f0', fontSize:14, fontWeight:600 }}>{seq.leads}</p>
                </div>
                <div>
                  <p style={{ color:'#6b7280', fontSize:10 }}>Replied</p>
                  <p style={{ color:'#22c55e', fontSize:14, fontWeight:600 }}>{seq.replied}</p>
                </div>
                <div>
                  <p style={{ color:'#6b7280', fontSize:10 }}>Rate</p>
                  <p style={{ color:'#a855f7', fontSize:14, fontWeight:600 }}>{Math.round(seq.replied/seq.leads*100)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sequence detail */}
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, padding:24 }}>
          {!activeSeq ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', minHeight:300 }}>
              <p style={{ color:'#374151', fontSize:12 }}>← Select a sequence to view steps</p>
            </div>
          ) : (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <p style={{ color:'#e2e8f0', fontSize:14, fontWeight:600, fontFamily:'Inter,sans-serif' }}>{activeSeq.name}</p>
                <div style={{ display:'flex', gap:8 }}>
                  <button className='btn-ghost' style={{ padding:'6px 14px', borderRadius:7, fontSize:11, cursor:'pointer',
                    fontFamily:'JetBrains Mono,monospace' }}>
                    Edit
                  </button>
                  <button style={{ padding:'6px 14px', background:'linear-gradient(135deg,#a855f7,#7c3aed)',
                    border:'none', borderRadius:7, color:'white', fontSize:11, cursor:'pointer',
                    fontFamily:'JetBrains Mono,monospace' }}>
                    ▶ Run
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ position:'relative' }}>
                {/* vertical line */}
                <div style={{ position:'absolute', left:18, top:20, bottom:20,
                  width:1, background:'rgba(255,255,255,0.05)' }}/>
                {activeSeq.steps.map((step,i) => (
                  <div key={i} style={{ display:'flex', gap:16, marginBottom:20, position:'relative' }}>
                    {/* Icon */}
                    <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0,
                      background:`${typeColors[step.type]}15`,
                      border:`1px solid ${typeColors[step.type]}33`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:700, color:typeColors[step.type], zIndex:1 }}>
                      {typeIcons[step.type]}
                    </div>
                    {/* Content */}
                    <div style={{ flex:1, background:'rgba(255,255,255,0.02)',
                      border:'1px solid rgba(255,255,255,0.04)', borderRadius:10, padding:'12px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                        <p style={{ color:'#e2e8f0', fontSize:12, fontWeight:500 }}>{step.subject}</p>
                        <span style={{ color:'#374151', fontSize:10 }}>Day {step.day}</span>
                      </div>
                      <p style={{ color:'#4b5563', fontSize:10, lineHeight:1.4 }}>{step.action}</p>
                      {step.persona && (
                        <span style={{ display:'inline-block', marginTop:6, fontSize:9, padding:'2px 8px',
                          borderRadius:20, background:'rgba(168,85,247,0.08)', border:'1px solid rgba(168,85,247,0.2)',
                          color:'#a855f7' }}>
                          {step.persona.toUpperCase()} PERSONA
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}