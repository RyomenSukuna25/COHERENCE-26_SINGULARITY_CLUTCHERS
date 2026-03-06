import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import LeadDetail from '../components/LeadDetail'
import SignalFeed from '../components/SignalFeed'
import SafetyMeters from '../components/SafetyMeters'

const API = 'http://localhost:8000/api'

const MOCK_STATS = { totalLeads: 50, contacted: 38, replied: 6, avgMirrorScore: 74 }
const MOCK_LEADS = [
  { id: 1, name: 'Rahul Sharma',  company: 'TechCorp',  role: 'CTO',      email: 'rahul@techcorp.com',   stage: 'Contacted', persona: 'dev',   mirrorScore: 82, signal: 'Opened',    industry: 'Technology' },
  { id: 2, name: 'Priya Mehta',   company: 'GrowthX',   role: 'CEO',      email: 'priya@growthx.com',    stage: 'Replied',   persona: 'arjun', mirrorScore: 91, signal: 'Replied',   industry: 'SaaS' },
  { id: 3, name: 'Aakash Joshi',  company: 'Finova',    role: 'Manager',  email: 'aakash@finova.com',    stage: 'Cold',      persona: 'priya', mirrorScore: 44, signal: 'Gone Cold', industry: 'Finance' },
  { id: 4, name: 'Sneha Patil',   company: 'DataSync',  role: 'Founder',  email: 'sneha@datasync.com',   stage: 'Pending',   persona: 'arjun', mirrorScore: 67, signal: null,        industry: 'Data' },
  { id: 5, name: 'Vikram Nair',   company: 'CloudBase', role: 'Engineer', email: 'vikram@cloudbase.com', stage: 'Contacted', persona: 'dev',   mirrorScore: 78, signal: 'Clicked',   industry: 'Cloud' },
]
const FUNNEL_DATA = [
  { name: 'Loaded', value: 50 }, { name: 'Contacted', value: 38 },
  { name: 'Opened', value: 24 }, { name: 'Clicked', value: 14 }, { name: 'Replied', value: 6 },
]
const SCORE_DIST = [
  { range: '0-40', count: 6 }, { range: '41-60', count: 8 },
  { range: '61-80', count: 22 }, { range: '81-100', count: 14 },
]
const PERSONA_PIE = [
  { name: 'Arjun', value: 18, color: '#f87171' },
  { name: 'Priya', value: 15, color: '#fbbf24' },
  { name: 'Dev',   value: 17, color: '#60a5fa' },
]
const SIGNAL_COLORS = {
  Replied: 'text-green-400 bg-green-900/30 border-green-700',
  Opened: 'text-purple-400 bg-purple-900/30 border-purple-700',
  Clicked: 'text-blue-400 bg-blue-900/30 border-blue-700',
  'Gone Cold': 'text-gray-400 bg-gray-900/30 border-gray-700',
  Bounced: 'text-red-400 bg-red-900/30 border-red-700',
}
const STAGE_COLORS = { Replied: 'text-green-400', Contacted: 'text-blue-400', Cold: 'text-gray-500', Pending: 'text-yellow-400' }
const PERSONA_COLORS = { arjun: 'text-red-400', priya: 'text-yellow-400', dev: 'text-blue-400' }
const PERSONA_LABELS = { arjun: '🔴 Arjun', priya: '🟡 Priya', dev: '🔵 Dev' }

function useClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i) }, [])
  return t
}
function useCountUp(target) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let s = 0; const step = target / 60
    const t = setInterval(() => { s += step; if (s >= target) { setV(target); clearInterval(t) } else setV(Math.floor(s)) }, 16)
    return () => clearInterval(t)
  }, [target])
  return v
}
function StatCard({ icon, label, value, sub, color }) {
  const count = useCountUp(typeof value === 'number' ? value : 0)
  const c = {
    purple: { card: 'border-purple-800/60 bg-purple-950/30', icon: 'bg-purple-900/50 text-purple-400', val: 'text-purple-300' },
    green:  { card: 'border-green-800/60 bg-green-950/30',   icon: 'bg-green-900/50 text-green-400',   val: 'text-green-300' },
    yellow: { card: 'border-yellow-800/60 bg-yellow-950/30', icon: 'bg-yellow-900/50 text-yellow-400', val: 'text-yellow-300' },
    blue:   { card: 'border-blue-800/60 bg-blue-950/30',     icon: 'bg-blue-900/50 text-blue-400',     val: 'text-blue-300' },
  }[color] || { card: 'border-purple-800/60 bg-purple-950/30', icon: 'bg-purple-900/50 text-purple-400', val: 'text-purple-300' }
  return (
    <div className={`rounded-2xl border ${c.card} p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${c.icon} flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-widest font-mono mb-1">{label}</p>
        <p className={`text-3xl font-bold ${c.val} font-mono`}>{count}{label.includes('SCORE') ? '%' : ''}</p>
        {sub && <p className="text-gray-600 text-xs mt-1 font-mono">{sub}</p>}
      </div>
    </div>
  )
}
function MirrorBar({ score }) {
  const color = score >= 70 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div style={{ width: `${score}%`, background: color }} className="h-full rounded-full" />
      </div>
      <span style={{ color }} className="text-xs font-mono w-6 text-right">{score}</span>
    </div>
  )
}
function SignalBadge({ signal }) {
  if (!signal) return <span className="text-gray-700 font-mono text-xs">—</span>
  const cls = SIGNAL_COLORS[signal] || 'text-gray-400 bg-gray-900/30 border-gray-700'
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${cls}`}>{signal}</span>
}
function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-0.5 h-4 bg-purple-500 rounded-full" />
        <h2 className="text-gray-300 text-sm font-bold uppercase tracking-widest font-mono">{children}</h2>
      </div>
      {right && <span className="text-gray-600 text-xs font-mono">{right}</span>}
    </div>
  )
}
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
      <p className="text-gray-400 text-xs font-mono">{label}</p>
      <p className="text-purple-400 text-sm font-bold font-mono">{payload[0]?.value}</p>
    </div>
  )
}

function LeadTable({ leads, onSelect }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-800/40">
          {['Lead', 'Company', 'Role', 'Persona', 'Mirror', 'Signal', 'Stage', ''].map(h => (
            <th key={h} className="px-4 py-3 text-left text-gray-600 text-xs font-mono uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id} onClick={() => onSelect(lead)}
            className="border-b border-gray-800/20 hover:bg-gray-800/30 cursor-pointer transition-colors group">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-800 to-purple-950 border border-purple-700/50 flex items-center justify-center text-xs font-bold font-mono text-purple-300 flex-shrink-0">
                  {lead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-gray-200 text-sm font-mono">{lead.name}</p>
                  <p className="text-gray-600 text-xs font-mono">{lead.email}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-gray-400 text-sm font-mono">{lead.company}</td>
            <td className="px-4 py-3 text-gray-500 text-sm font-mono">{lead.role}</td>
            <td className="px-4 py-3"><span className={`text-sm font-mono font-bold ${PERSONA_COLORS[lead.persona] || 'text-gray-400'}`}>{PERSONA_LABELS[lead.persona] || lead.persona}</span></td>
            <td className="px-4 py-3 w-32"><MirrorBar score={lead.mirrorScore} /></td>
            <td className="px-4 py-3"><SignalBadge signal={lead.signal} /></td>
            <td className="px-4 py-3"><span className={`text-xs font-mono uppercase ${STAGE_COLORS[lead.stage] || 'text-gray-500'}`}>{lead.stage}</span></td>
            <td className="px-4 py-3"><span className="text-gray-600 group-hover:text-purple-400 text-xs font-mono transition-colors">View →</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('overview')
  const [leads] = useState(MOCK_LEADS)
  const [stats] = useState(MOCK_STATS)
  const [selectedLead, setSelectedLead] = useState(null)
  const [search, setSearch] = useState('')
  const clock = useClock()

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  )

  const NAV = [
    { id: 'overview', icon: '⚡', label: 'Overview' },
    { id: 'leads',    icon: '👥', label: 'Leads' },
    { id: 'signals',  icon: '📡', label: 'Signals' },
    { id: 'safety',   icon: '🛡️', label: 'Safety' },
    { id: 'intel',    icon: '🧠', label: 'AI Intel' },
  ]

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <aside className="w-56 bg-black/40 border-r border-gray-800/60 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-white font-bold text-lg tracking-wider font-mono" style={{ textShadow: '0 0 12px rgba(167,139,250,0.6)' }}>NEXUS</p>
              <p className="text-gray-600 text-xs font-mono">v2 — Mission Control</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono transition-all ${
                page === n.id ? 'bg-purple-600/20 text-purple-300 border border-purple-700/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
              }`}>
              <span>{n.icon}</span><span>{n.label}</span>
              {page === n.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800/60">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-xs font-bold font-mono">C</div>
            <div>
              <p className="text-gray-300 text-xs font-mono">{user?.name || 'Chirag'}</p>
              <p className="text-gray-600 text-xs font-mono">Lead Dev</p>
            </div>
          </div>
          {onLogout && <button onClick={onLogout} className="text-xs text-gray-600 hover:text-red-400 font-mono transition-colors">→ Sign out</button>}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-gray-800/60 flex items-center justify-between px-6 flex-shrink-0 bg-gray-950/80">
          <div>
            <h1 className="text-white font-bold text-sm font-mono uppercase tracking-widest">{NAV.find(n => n.id === page)?.label}</h1>
            <p className="text-gray-600 text-xs font-mono">NEXUS › {page}</p>
          </div>
          <div className="flex items-center gap-6">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 font-mono placeholder-gray-600 outline-none focus:border-purple-600 w-48 transition-colors" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulse 2s infinite' }} />
              <span className="text-green-400 text-xs font-mono">{clock.toLocaleTimeString('en-IN', { hour12: false })}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {page === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <StatCard icon="👥" label="Total Leads"      value={stats.totalLeads}    sub="loaded in system"   color="purple" />
                <StatCard icon="📤" label="Contacted"        value={stats.contacted}      sub="outreach sent"      color="blue" />
                <StatCard icon="💬" label="Replied"          value={stats.replied}        sub="responses received" color="green" />
                <StatCard icon="🪞" label="Avg Mirror Score" value={stats.avgMirrorScore} sub="AI quality index"   color="yellow" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
                  <SectionTitle>Outreach Funnel</SectionTitle>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} width={65} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
                  <SectionTitle>Score Distribution</SectionTitle>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={SCORE_DIST}>
                      <XAxis dataKey="range" tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'monospace' }} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {SCORE_DIST.map((e, i) => (
                          <Cell key={i} fill={i === 3 ? '#34d399' : i === 2 ? '#a78bfa' : i === 1 ? '#fbbf24' : '#f87171'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
                  <SectionTitle>Persona Split</SectionTitle>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="60%" height={170}>
                      <PieChart>
                        <Pie data={PERSONA_PIE} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                          {PERSONA_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {PERSONA_PIE.map(p => (
                        <div key={p.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                          <span className="text-gray-400 text-xs font-mono">{p.name} {p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-800/60">
                  <SectionTitle right={`${filtered.length} leads`}>Lead Command Center</SectionTitle>
                </div>
                <LeadTable leads={filtered} onSelect={setSelectedLead} />
              </div>
            </div>
          )}

          {page === 'leads' && (
            <div className="space-y-4">
              <SectionTitle right={`${filtered.length} total`}>All Leads</SectionTitle>
              <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl overflow-hidden">
                <LeadTable leads={filtered} onSelect={setSelectedLead} />
              </div>
            </div>
          )}

          {page === 'signals' && (
            <div className="space-y-4">
              <SectionTitle>Live Signal Feed</SectionTitle>
              <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
                <SignalFeed />
              </div>
            </div>
          )}

          {page === 'safety' && (
            <div className="space-y-4">
              <SectionTitle>Safety Controls</SectionTitle>
              <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
                <SafetyMeters />
              </div>
            </div>
          )}

          {page === 'intel' && (
            <div className="space-y-4">
              <SectionTitle>AI Intelligence Summary</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 border border-purple-800/40 rounded-2xl p-5 space-y-3">
                  {[
                    { label: 'Avg Mirror Score',    value: `${stats.avgMirrorScore}%`, color: 'text-purple-400' },
                    { label: 'Reply Rate',           value: `${((stats.replied/stats.totalLeads)*100).toFixed(1)}%`, color: 'text-green-400' },
                    { label: 'Outreach Rate',        value: `${((stats.contacted/stats.totalLeads)*100).toFixed(1)}%`, color: 'text-blue-400' },
                    { label: 'Best Persona Today',   value: 'Arjun', color: 'text-red-400' },
                    { label: 'Predicted Reply Rate', value: '18.2%', color: 'text-yellow-400' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-800/40 last:border-0">
                      <span className="text-gray-500 text-sm font-mono">{item.label}</span>
                      <span className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5">
                  <p className="text-gray-600 text-xs font-mono uppercase tracking-widest mb-4">Click a lead to run AI features</p>
                  <div className="space-y-2">
                    {leads.map(l => (
                      <button key={l.id} onClick={() => { setSelectedLead(l); setPage('overview') }}
                        className="w-full flex items-center justify-between p-3 bg-gray-800/40 hover:bg-gray-700/40 rounded-xl transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-purple-900 flex items-center justify-center text-xs font-mono text-purple-300">
                            {l.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-gray-300 text-sm font-mono">{l.name}</span>
                        </div>
                        <span className="text-gray-600 group-hover:text-purple-400 text-xs font-mono">Open →</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
      `}</style>
    </div>
  )
}