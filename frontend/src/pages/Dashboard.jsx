import { useState, useEffect } from 'react'
import axios from 'axios'
import LeadDetail from '../components/LeadDetail'
import SignalFeed from '../components/SignalFeed'
import SafetyMeters from '../components/SafetyMeters'
import PersonaPreview from '../components/PersonaPreview'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'http://localhost:8000/api'

const MOCK_LEADS = [
  { id: '1', name: 'Rahul Sharma', company: 'TechCorp', role: 'CTO', persona: 'dev', status: 'sent', score: 74, pain_points: ['scaling infrastructure', 'technical debt', 'team velocity'], hook: 'noticed TechCorp is hiring backend engineers — scaling challenge?', approach: 'Lead with a technical metric' },
  { id: '2', name: 'Priya Mehta', company: 'StartupXYZ', role: 'HR Manager', persona: 'priya', status: 'opened', score: 61, pain_points: ['team coordination', 'manual processes', 'reporting'], hook: 'StartupXYZ growing fast — outreach keeping up?', approach: 'Lead with time savings' },
  { id: '3', name: 'Arjun Singh', company: 'ScaleUp Inc', role: 'CEO', persona: 'arjun', status: 'replied', score: 82, pain_points: ['revenue growth', 'market competition', 'efficiency'], hook: 'ScaleUp Inc scaling — outreach the bottleneck?', approach: 'Lead with business impact and ROI' },
]

const FUNNEL = [
  { stage: 'Uploaded', count: 50 }, { stage: 'Enriched', count: 50 },
  { stage: 'Sent', count: 38 }, { stage: 'Opened', count: 22 },
  { stage: 'Clicked', count: 11 }, { stage: 'Replied', count: 6 },
]

const STATS = [
  { label: 'Total Leads', value: 50, color: 'text-white' },
  { label: 'Emails Sent', value: 38, color: 'text-purple-400' },
  { label: 'Replied', value: 6, color: 'text-green-400' },
  { label: 'Avg Mirror Score', value: 74, color: 'text-yellow-400' },
]

export default function Dashboard({ user, onSignOut }) {
  const [leads, setLeads] = useState(MOCK_LEADS)
  const [selected, setSelected] = useState(null)
  const [previewLead, setPreviewLead] = useState(MOCK_LEADS[0])
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    axios.get(`${API}/leads/all`)
      .then(r => { if (r.data.length > 0) setLeads(r.data) })
      .catch(() => {})
  }, [])

  return (
    <div className='min-h-screen bg-gray-950 text-white'>
      {/* Nav */}
      <div className='border-b border-gray-800 px-8 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='text-2xl'>⚡</span>
          <span className='text-xl font-bold text-purple-400'>NEXUS</span>
          <span className='text-gray-600 text-sm'>v2</span>
        </div>
        <div className='flex items-center gap-4'>
          <span className='flex items-center gap-2 text-green-400 text-sm'>
            <span className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
            ACTIVE
          </span>
          {user && <span className='text-gray-500 text-sm'>{user.displayName || user.email}</span>}
          {onSignOut && (
            <button onClick={onSignOut} className='text-gray-600 hover:text-gray-400 text-xs'>Sign out</button>
          )}
        </div>
      </div>

      <div className='px-8 py-6 space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Mission Control</h1>
          <p className='text-gray-500 text-sm mt-1'>Singularity Clutchers — NEXUS v2</p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-4 gap-4'>
          {STATS.map(s => (
            <div key={s.label} className='bg-gray-900 rounded-xl p-5 border border-gray-800 text-center'>
              <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
              <p className='text-gray-500 text-sm mt-2'>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className='flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit'>
          {['overview', 'leads', 'personas'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all
                ${tab === t ? 'bg-purple-700 text-white' : 'text-gray-500 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className='space-y-5'>
            <div className='grid grid-cols-2 gap-5'>
              <SignalFeed />
              <SafetyMeters />
            </div>
            <div className='bg-gray-900 rounded-xl p-5 border border-gray-800'>
              <h3 className='text-purple-400 font-bold mb-4'>📊 Outreach Funnel</h3>
              <ResponsiveContainer width='100%' height={240}>
                <BarChart data={FUNNEL}>
                  <XAxis dataKey='stage' stroke='#6b7280' fontSize={12} />
                  <YAxis stroke='#6b7280' fontSize={12} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #7c3aed', borderRadius: '8px', color: 'white' }} />
                  <Bar dataKey='count' fill='#7c3aed' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* LEADS */}
        {tab === 'leads' && (
          <div className='bg-gray-900 rounded-xl border border-gray-800 overflow-hidden'>
            <div className='p-5 border-b border-gray-800'>
              <h3 className='text-purple-400 font-bold'>👥 Lead Pipeline</h3>
              <p className='text-gray-500 text-xs mt-1'>Click any lead to open full profile</p>
            </div>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-800'>
                  {['Name', 'Company', 'Role', 'Persona', 'Score', 'Status'].map(h => (
                    <th key={h} className='text-left text-xs text-gray-500 font-bold uppercase tracking-wide px-5 py-3'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => {
                  const statusColor = { replied: 'text-green-400', opened: 'text-blue-400', sent: 'text-purple-400', pending: 'text-gray-400' }[lead.status] || 'text-gray-400'
                  const personaBadge = { arjun: 'text-red-400 bg-red-900/20 border-red-800', priya: 'text-yellow-400 bg-yellow-900/20 border-yellow-800', dev: 'text-blue-400 bg-blue-900/20 border-blue-800' }[lead.persona] || 'text-gray-400 bg-gray-800 border-gray-700'
                  return (
                    <tr key={i} onClick={() => setSelected(lead)}
                      className='border-b border-gray-800 hover:bg-purple-900/10 cursor-pointer transition-colors'>
                      <td className='px-5 py-4 font-medium'>{lead.name}</td>
                      <td className='px-5 py-4 text-gray-400'>{lead.company}</td>
                      <td className='px-5 py-4 text-gray-400 text-sm'>{lead.role}</td>
                      <td className='px-5 py-4'>
                        <span className={`text-xs px-2 py-1 rounded-full border ${personaBadge}`}>{lead.persona}</span>
                      </td>
                      <td className='px-5 py-4'>
                        <span className={`font-bold ${lead.score >= 70 ? 'text-green-400' : lead.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{lead.score}</span>
                      </td>
                      <td className={`px-5 py-4 text-sm capitalize ${statusColor}`}>{lead.status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PERSONAS */}
        {tab === 'personas' && (
          <div className='space-y-4'>
            <div className='flex gap-3 flex-wrap'>
              {leads.map(l => (
                <button key={l.id} onClick={() => setPreviewLead(l)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all
                    ${previewLead?.id === l.id ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                  {l.name}
                </button>
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