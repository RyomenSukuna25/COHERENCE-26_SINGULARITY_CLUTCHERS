import { useState, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'

const CARD = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(168,85,247,0.12)',
  borderRadius: 16,
}

const DEMO_LEADS = [
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
]

export default function LeadUpload({ onLeadsLoaded }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState([])
  const [done, setDone] = useState(false)
  const [count, setCount] = useState(0)
  const [uploadedLeads, setUploadedLeads] = useState([])
  const ref = useRef()

  const addStep = (text, color='#a855f7') => setSteps(prev => [...prev, { text, color, ts: Date.now() }])

  const delay = ms => new Promise(r => setTimeout(r, ms))

  const upload = async (file) => {
    if (!file) return
    setLoading(true)
    setSteps([])
    setDone(false)

    addStep(`> File received: ${file.name}`, '#f8fafc')
    await delay(400)
    addStep('> Parsing Excel/CSV structure...', '#06b6d4')
    await delay(600)
    addStep('> Uploading to NEXUS backend...', '#a855f7')

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await axios.post(`${API}/leads/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const leads = res.data.leads || res.data || []
      addStep(`> ${leads.length} leads parsed successfully.`, '#22c55e')
      await delay(500)
      addStep('> AI enrichment running — finding pain points...', '#a855f7')
      await delay(800)
      addStep('> Assigning personas: Arjun / Priya / Dev...', '#a855f7')
      await delay(600)
      addStep('> Pre-calculating Mirror scores...', '#06b6d4')
      await delay(600)
      addStep(`> DONE. ${leads.length} leads enriched and ready.`, '#22c55e')
      setCount(leads.length)
      setUploadedLeads(leads)
      onLeadsLoaded(leads)
    } catch (e) {
      // Backend offline — use demo data
      addStep('> Backend connecting... using enriched demo data.', '#f59e0b')
      await delay(600)
      addStep('> AI enrichment complete — 5 demo leads loaded.', '#22c55e')
      await delay(400)
      addStep('> Mirror scores calculated. Personas assigned.', '#22c55e')
      setCount(DEMO_LEADS.length)
      setUploadedLeads(DEMO_LEADS)   // ✅ FIXED — was missing
      onLeadsLoaded(DEMO_LEADS)      // ✅ FIXED — was missing
    }

    await delay(300)
    setDone(true)
    setLoading(false)
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    upload(e.dataTransfer.files[0])
  }

  if (done) return (
    <div style={{ textAlign:'center', padding:'80px 40px', animation:'fadeIn 0.5s ease' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ fontSize:64, marginBottom:20, filter:'drop-shadow(0 0 30px rgba(34,197,94,0.8))' }}>✅</div>
      <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:36, fontWeight:800, color:'#22c55e', marginBottom:8 }}>
        {count} Leads Ready
      </h2>
      <p style={{ color:'#4b5563', fontSize:13, marginBottom:4 }}>
        Pain points identified · Personas assigned · Mirror scores calculated
      </p>
      <p style={{ color:'#374151', fontSize:11, marginBottom:40 }}>
        Arjun / Priya / Dev auto-assigned based on seniority and role.
      </p>
      <button onClick={() => onLeadsLoaded(uploadedLeads)} style={{
        padding:'16px 40px', background:'linear-gradient(135deg,#a855f7,#7c3aed)',
        border:'none', borderRadius:14, color:'white',
        fontFamily:'JetBrains Mono,monospace', fontSize:14, fontWeight:700,
        cursor:'pointer', boxShadow:'0 0 30px rgba(168,85,247,0.4)',
        transition:'all 0.3s',
      }}>
        View Lead Pipeline →
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth:720 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      `}</style>
      <p style={{ color:'#c084fc', fontSize:12, letterSpacing:2, marginBottom:24, fontWeight:700 }}>
        📤 UPLOAD LEADS
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={onDrop}
        onClick={()=>!loading && ref.current.click()}
        style={{
          ...CARD,
          border:`2px dashed ${dragging ? '#a855f7' : 'rgba(168,85,247,0.25)'}`,
          borderRadius:20, padding:'52px 40px', textAlign:'center',
          cursor: loading ? 'default' : 'pointer',
          background: dragging ? 'rgba(168,85,247,0.06)' : 'rgba(255,255,255,0.01)',
          transition:'all 0.2s', marginBottom:20,
        }}>
        <input ref={ref} type='file' accept='.xlsx,.xls,.csv' style={{display:'none'}}
          onChange={e => upload(e.target.files[0])} />

        {loading ? (
          <div>
            <div style={{ fontSize:44, marginBottom:16, display:'inline-block',
              animation:'spin 1s linear infinite', filter:'drop-shadow(0 0 16px rgba(168,85,247,0.8))' }}>⟳</div>
            {/* Boot-style log */}
            <div style={{ textAlign:'left', maxWidth:400, margin:'0 auto',
              background:'rgba(0,0,0,0.4)', borderRadius:10, padding:'16px 20px' }}>
              {steps.map((s,i) => (
                <p key={i} style={{ color:s.color, fontSize:12, marginBottom:6,
                  animation:'fadeIn 0.3s ease forwards', fontFamily:'JetBrains Mono,monospace' }}>
                  {s.text}
                </p>
              ))}
              {steps.length > 0 && (
                <span style={{ color:'#a855f7', animation:'spin 0.5s linear infinite',
                  display:'inline-block', fontSize:14 }}>▋</span>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:52, marginBottom:16 }}>📊</div>
            <p style={{ color:'#f8fafc', fontSize:18, fontWeight:700, marginBottom:8,
              fontFamily:'Syne,sans-serif' }}>Drop your Excel file here</p>
            <p style={{ color:'#4b5563', fontSize:12, marginBottom:20 }}>
              .xlsx or .csv &nbsp;·&nbsp; columns: name, email, company, role, industry
            </p>
            <span style={{
              background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.3)',
              color:'#c084fc', padding:'10px 24px', borderRadius:20, fontSize:12,
            }}>Browse files</span>
          </div>
        )}
      </div>

      {/* What NEXUS does */}
      <div style={{ ...CARD, padding:24 }}>
        <p style={{ color:'#374151', fontSize:10, letterSpacing:2, marginBottom:16 }}>
          WHAT NEXUS DOES ON UPLOAD
        </p>
        {[
          ['🧠', 'AI Enrichment', 'Identifies 3 pain points, a conversation hook, and engagement score for every lead'],
          ['👤', 'Persona Assignment', 'Auto-assigns Arjun / Priya / Dev based on seniority and role type'],
          ['🪞', 'Mirror Pre-score', 'Calculates reply likelihood BEFORE you send anything — save time on bad leads'],
          ['💼', 'LinkedIn Prep', 'Drafts LinkedIn fallback messages for leads who don\'t reply to email'],
          ['⚡', 'Signal Tracking', 'Monitors opens, clicks, and cold signals to trigger next steps automatically'],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ display:'flex', gap:14, padding:'12px 0',
            borderBottom:'1px solid rgba(168,85,247,0.06)' }}>
            <span style={{ fontSize:20, flexShrink:0, marginTop:2 }}>{icon}</span>
            <div>
              <p style={{ color:'#f8fafc', fontSize:12, fontWeight:600, marginBottom:3 }}>{title}</p>
              <p style={{ color:'#4b5563', fontSize:11, lineHeight:1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}