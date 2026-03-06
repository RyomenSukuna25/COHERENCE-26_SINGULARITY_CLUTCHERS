import { useState, useEffect } from 'react'
import axios from 'axios'
import LeadDetail from '../components/LeadDetail'
import SignalFeed from '../components/SignalFeed'
import SafetyMeters from '../components/SafetyMeters'
import PersonaPreview from '../components/PersonaPreview'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const API = 'http://localhost:8000/api'

const MOCK_LEADS = [
  { id:'1', name:'Rahul Sharma', company:'TechCorp', role:'CTO', persona:'dev', status:'sent', score:74, pain_points:['Scaling infrastructure','Technical debt','Team velocity'], hook:'TechCorp is hiring 12 backend engineers — classic scaling inflection point.', approach:'Lead with a benchmark stat on engineering outreach response rates', email:'rahul@techcorp.com', industry:'Technology' },
  { id:'2', name:'Priya Mehta', company:'StartupXYZ', role:'HR Manager', persona:'priya', status:'opened', score:61, pain_points:['Manual candidate outreach','Team coordination overhead','Reporting delays'], hook:'StartupXYZ doubled headcount in 6 months — HR ops at breaking point?', approach:'Lead with time savings and reduced manual work', email:'priya@startupxyz.com', industry:'HR Tech' },
  { id:'3', name:'Arjun Singh', company:'ScaleUp Inc', role:'CEO', persona:'arjun', status:'replied', score:82, pain_points:['Revenue growth plateau','Sales team efficiency','Market expansion'], hook:'ScaleUp Inc raised Series A — outreach still manual?', approach:'Lead with revenue impact and 3x reply rate stat', email:'arjun@scaleup.com', industry:'SaaS' },
  { id:'4', name:'Neha Kapoor', company:'FinFlow', role:'VP Sales', persona:'arjun', status:'pending', score:68, pain_points:['Pipeline visibility','Cold outreach conversion','Follow-up consistency'], hook:'FinFlow expanding to 3 new markets — sales stack ready?', approach:'Lead with pipeline conversion benchmarks', email:'neha@finflow.com', industry:'Fintech' },
  { id:'5', name:'Vikram Iyer', company:'DataLens', role:'CTO', persona:'dev', status:'sent', score:79, pain_points:['Data pipeline reliability','Engineering hiring','Tech debt accumulation'], hook:'DataLens processing 10TB/day — outreach still on spreadsheets?', approach:'Lead with engineering productivity metrics', email:'vikram@datalens.com', industry:'Data' },
]

const FUNNEL = [
  { stage:'Uploaded', count:50, fill:'#7c3aed' },
  { stage:'Enriched', count:50, fill:'#6d28d9' },
  { stage:'Sent', count:38, fill:'#5b21b6' },
  { stage:'Opened', count:22, fill:'#4c1d95' },
  { stage:'Clicked', count:11, fill:'#3b0764' },
  { stage:'Replied', count:6, fill:'#2e1065' },
]

const TREND = [
  {day:'Mon',replies:2,sent:8},
  {day:'Tue',replies:3,sent:10},
  {day:'Wed',replies:1,sent:6},
  {day:'Thu',replies:5,sent:12},
  {day:'Fri',replies:4,sent:9},
  {day:'Sat',replies:6,sent:14},
  {day:'Sun',replies:8,sent:15},
]

const PERSONA_COLORS = {
  arjun:{ bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.3)', text:'#f87171', label:'🔴 Arjun' },
  priya:{ bg:'rgba(234,179,8,0.1)', border:'rgba(234,179,8,0.3)', text:'#fbbf24', label:'🟡 Priya' },
  dev:{ bg:'rgba(59,130,246,0.1)', border:'rgba(59,130,246,0.3)', text:'#60a5fa', label:'🔵 Dev' },
}

const STATUS_COLORS = {
  replied:{ color:'#34d399', bg:'rgba(52,211,153,0.1)', border:'rgba(52,211,153,0.3)' },
  opened:{ color:'#60a5fa', bg:'rgba(96,165,250,0.1)', border:'rgba(96,165,250,0.3)' },
  sent:{ color:'#a78bfa', bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)' },
  pending:{ color:'#6b7280', bg:'rgba(107,114,128,0.1)', border:'rgba(107,114,128,0.3)' },
}

export default function Dashboard({ user, onSignOut }) {
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [selected, setSelected] = useState(null)
  const [previewLead, setPreviewLead] = useState(MOCK_LEADS[0])
  const [tab, setTab] = useState('overview')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    axios.get(`${API}/leads/all`).then(r => { if (r.data?.length > 0) setLeads(r.data) }).catch(() => {})
  }, [])

  const stats = [
    { label:'LEADS LOADED', value:leads.length, sub:'+12 today', color:'#a78bfa', glow:'rgba(167,139,250,0.3)' },
    { label:'EMAILS SENT', value:38, sub:'via SendGrid', color:'#818cf8', glow:'rgba(129,140,248,0.3)' },
    { label:'REPLIED', value:6, sub:'15.8% rate', color:'#34d399', glow:'rgba(52,211,153,0.3)' },
    { label:'AVG MIRROR', value:'74', sub:'/ 100 score', color:'#fbbf24', glow:'rgba(251,191,36,0.3)' },
  ]

  return (
    <div style={{
      minHeight:'100vh', background:'#030712', color:'white',
      fontFamily:"'Space Mono', monospace"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .stat-card:hover { transform:translateY(-3px); transition:transform 0.2s ease; }
        .lead-row:hover { background:rgba(124,58,237,0.08) !important; }
        .tab-btn:hover { color:#a78bfa !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0a0a0f; }
        ::-webkit-scrollbar-thumb { background:#7c3aed; border-radius:2px; }
        * { box-sizing:border-box; }
      `}</style>

      {/* Top nav */}
      <div style={{
        borderBottom:'1px solid rgba(124,58,237,0.2)',
        padding:'14px 32px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(3,7,18,0.95)', backdropFilter:'blur(20px)',
        position:'sticky', top:0, zIndex:40
      }}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:22,filter:'drop-shadow(0 0 10px rgba(124,58,237,0.8))'}}>⚡</span>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,
            background:'linear-gradient(135deg,#a78bfa,#7c3aed)',
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:-1}}>
            NEXUS
          </span>
          <span style={{color:'#1f2937',fontSize:11}}>v2</span>
          <div style={{width:1,height:20,background:'rgba(124,58,237,0.2)',margin:'0 8px'}}/>
          <span style={{color:'#374151',fontSize:11,letterSpacing:1}}>MISSION CONTROL</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:24}}>
          <span style={{color:'#374151',fontSize:11,letterSpacing:1}}>
            {time.toLocaleTimeString()}
          </span>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#34d399',display:'inline-block',animation:'pulse 2s infinite'}}/>
            <span style={{color:'#34d399',fontSize:11,fontWeight:700,letterSpacing:2}}>ACTIVE</span>
          </div>
          <span style={{color:'#374151',fontSize:11}}>{user?.displayName}</span>
          <button onClick={onSignOut} style={{
            color:'#374151',fontSize:11,background:'none',border:'none',
            cursor:'pointer',fontFamily:"'Space Mono',monospace"
          }}>[ SIGN OUT ]</button>
        </div>
      </div>

      <div style={{padding:'32px',animation:'fadeIn 0.5s ease forwards'}}>

        {/* Header */}
        <div style={{marginBottom:32}}>
          <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:6}}>
            <h1 style={{
              fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800,
              margin:0, letterSpacing:-2,
              background:'linear-gradient(135deg,#ffffff,#a78bfa)',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'
            }}>Mission Control</h1>
            <span style={{color:'#1f2937',fontSize:12,letterSpacing:2}}>// COHERENCE '26</span>
          </div>
          <p style={{color:'#374151',fontSize:11,margin:0,letterSpacing:1}}>
            SINGULARITY CLUTCHERS — NEXUS OUTREACH INTELLIGENCE SYSTEM
          </p>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
          {stats.map(s => (
            <div key={s.label} className='stat-card' style={{
              background:'rgba(10,5,20,0.8)',
              border:`1px solid ${s.glow}`,
              borderRadius:14, padding:'24px 20px',
              position:'relative', overflow:'hidden',
              boxShadow:`0 0 30px ${s.glow}`,
              cursor:'default'
            }}>
              <div style={{
                position:'absolute',top:0,right:0,width:80,height:80,
                background:`radial-gradient(circle,${s.glow} 0%,transparent 70%)`,
                filter:'blur(20px)'
              }}/>
              <p style={{color:'#374151',fontSize:10,letterSpacing:2,marginBottom:12,margin:'0 0 12px'}}>{s.label}</p>
              <p style={{color:s.color,fontSize:40,fontWeight:700,margin:'0 0 6px',fontFamily:"'Syne',sans-serif",
                filter:`drop-shadow(0 0 12px ${s.glow})`}}>{s.value}</p>
              <p style={{color:'#374151',fontSize:10,margin:0}}>{s.sub}</p>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${s.color},transparent)`,opacity:0.4}}/>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display:'flex',gap:2,background:'rgba(10,5,20,0.8)',
          border:'1px solid rgba(124,58,237,0.2)',
          borderRadius:12,padding:4,width:'fit-content',marginBottom:28
        }}>
          {['OVERVIEW','LEADS','PERSONAS'].map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())} className='tab-btn' style={{
              padding:'10px 24px',borderRadius:8,border:'none',
              background:tab===t.toLowerCase() ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent',
              color:tab===t.toLowerCase() ? 'white' : '#4b5563',
              fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700,
              cursor:'pointer', letterSpacing:1,
              boxShadow:tab===t.toLowerCase() ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
              transition:'all 0.2s ease'
            }}>{t}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <SignalFeed />
            <SafetyMeters />
            {/* Trend chart */}
            <div style={{
              background:'rgba(10,5,20,0.8)', border:'1px solid rgba(124,58,237,0.2)',
              borderRadius:14, padding:24
            }}>
              <p style={{color:'#7c3aed',fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:20}}>
                📈 REPLY TREND — 7 DAYS
              </p>
              <ResponsiveContainer width='100%' height={180}>
                <AreaChart data={TREND}>
                  <defs>
                    <linearGradient id='replyGrad' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#7c3aed' stopOpacity={0.4}/>
                      <stop offset='95%' stopColor='#7c3aed' stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey='day' stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563'}}/>
                  <YAxis stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563'}}/>
                  <Tooltip contentStyle={{background:'#0a0514',border:'1px solid #7c3aed',borderRadius:8,fontFamily:'Space Mono',fontSize:11}}/>
                  <Area type='monotone' dataKey='replies' stroke='#7c3aed' fill='url(#replyGrad)' strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Funnel */}
            <div style={{
              background:'rgba(10,5,20,0.8)', border:'1px solid rgba(124,58,237,0.2)',
              borderRadius:14, padding:24
            }}>
              <p style={{color:'#7c3aed',fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:20}}>
                📊 OUTREACH FUNNEL
              </p>
              <ResponsiveContainer width='100%' height={180}>
                <BarChart data={FUNNEL}>
                  <XAxis dataKey='stage' stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563'}}/>
                  <YAxis stroke='#1f2937' fontSize={10} tick={{fill:'#4b5563'}}/>
                  <Tooltip contentStyle={{background:'#0a0514',border:'1px solid #7c3aed',borderRadius:8,fontFamily:'Space Mono',fontSize:11}}/>
                  <Bar dataKey='count' fill='#7c3aed' radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* LEADS */}
        {tab === 'leads' && (
          <div style={{
            background:'rgba(10,5,20,0.8)', border:'1px solid rgba(124,58,237,0.2)',
            borderRadius:14, overflow:'hidden'
          }}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid rgba(124,58,237,0.15)',
              display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <p style={{color:'#a78bfa',fontSize:11,fontWeight:700,letterSpacing:2,margin:'0 0 4px'}}>👥 LEAD PIPELINE</p>
                <p style={{color:'#374151',fontSize:10,margin:0}}>Click any row to open full profile + AI tools</p>
              </div>
              <span style={{
                color:'#7c3aed',fontSize:10,
                border:'1px solid rgba(124,58,237,0.3)',
                padding:'4px 12px',borderRadius:20
              }}>{leads.length} leads loaded</span>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(124,58,237,0.1)'}}>
                  {['NAME','COMPANY','ROLE','PERSONA','MIRROR SCORE','STATUS'].map(h => (
                    <th key={h} style={{
                      textAlign:'left',padding:'12px 24px',
                      color:'#1f2937',fontSize:9,letterSpacing:2,fontWeight:700
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead,i) => {
                  const pc = PERSONA_COLORS[lead.persona] || PERSONA_COLORS.arjun
                  const sc = STATUS_COLORS[lead.status] || STATUS_COLORS.pending
                  const scoreColor = lead.score>=70?'#34d399':lead.score>=50?'#fbbf24':'#f87171'
                  return (
                    <tr key={i} className='lead-row' onClick={() => setSelected(lead)} style={{
                      borderBottom:'1px solid rgba(124,58,237,0.06)',
                      cursor:'pointer', transition:'background 0.15s'
                    }}>
                      <td style={{padding:'16px 24px'}}>
                        <p style={{color:'white',fontSize:12,fontWeight:700,margin:'0 0 2px'}}>{lead.name}</p>
                        <p style={{color:'#374151',fontSize:10,margin:0}}>{lead.email}</p>
                      </td>
                      <td style={{padding:'16px 24px',color:'#6b7280',fontSize:11}}>{lead.company}</td>
                      <td style={{padding:'16px 24px',color:'#4b5563',fontSize:10}}>{lead.role}</td>
                      <td style={{padding:'16px 24px'}}>
                        <span style={{
                          background:pc.bg, border:`1px solid ${pc.border}`,
                          color:pc.text, fontSize:10, padding:'4px 10px', borderRadius:20
                        }}>{pc.label}</span>
                      </td>
                      <td style={{padding:'16px 24px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{color:scoreColor,fontWeight:700,fontSize:16,
                            filter:`drop-shadow(0 0 6px ${scoreColor})`}}>{lead.score}</span>
                          <div style={{flex:1,height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,minWidth:60}}>
                            <div style={{width:`${lead.score}%`,height:'100%',background:scoreColor,borderRadius:2,
                              boxShadow:`0 0 8px ${scoreColor}`}}/>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:'16px 24px'}}>
                        <span style={{
                          background:sc.bg, border:`1px solid ${sc.border}`,
                          color:sc.color, fontSize:10, padding:'4px 10px', borderRadius:20, textTransform:'uppercase',letterSpacing:1
                        }}>{lead.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PERSONAS */}
        {tab === 'personas' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
              {leads.map(l => (
                <button key={l.id} onClick={() => setPreviewLead(l)} style={{
                  padding:'8px 18px', borderRadius:8,
                  background:previewLead?.id===l.id ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(10,5,20,0.8)',
                  border:`1px solid ${previewLead?.id===l.id ? 'rgba(167,139,250,0.5)' : 'rgba(124,58,237,0.2)'}`,
                  color:previewLead?.id===l.id ? 'white' : '#4b5563',
                  fontFamily:"'Space Mono',monospace", fontSize:11, cursor:'pointer',
                  boxShadow:previewLead?.id===l.id ? '0 0 20px rgba(124,58,237,0.4)' : 'none',
                  transition:'all 0.2s'
                }}>{l.name}</button>
              ))}
            </div>
            {previewLead && <PersonaPreview lead={previewLead} />}
          </div>
        )}
      </div>

      {selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}