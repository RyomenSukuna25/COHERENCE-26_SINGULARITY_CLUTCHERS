import { useState } from 'react'
import axios from 'axios'
import MirrorPanel from './MirrorPanel'

const API = 'http://localhost:8000/api'
const PERSONA_STYLE = {
  arjun: { color: 'text-red-400', border: 'border-red-700', bg: 'bg-red-900/20', label: '🔴 Arjun — The Closer' },
  priya: { color: 'text-yellow-400', border: 'border-yellow-700', bg: 'bg-yellow-900/20', label: '🟡 Priya — The Nurturer' },
  dev: { color: 'text-blue-400', border: 'border-blue-700', bg: 'bg-blue-900/20', label: '🔵 Dev — The Analyst' },
}

export default function LeadDetail({ lead, onClose }) {
  const [tab, setTab] = useState('profile')
  const [message, setMessage] = useState('')
  const [linkedin, setLinkedin] = useState(null)
  const [genLoading, setGenLoading] = useState(false)
  const [liLoading, setLiLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const persona = PERSONA_STYLE[lead.persona] || PERSONA_STYLE.arjun

  const generateEmail = async () => {
    setGenLoading(true)
    try {
      const res = await axios.post(`${API}/messages/generate`, {
        lead_name: lead.name, lead_company: lead.company,
        lead_role: lead.role, persona: lead.persona
      })
      setMessage(res.data.message)
    } catch {
      setMessage(`Hi ${lead.name},\n\nI came across ${lead.company} and wanted to reach out.\n\nWorth a quick chat?`)
    }
    setGenLoading(false)
  }

  const generateLinkedIn = async () => {
    setLiLoading(true)
    try {
      const res = await axios.post(`${API}/linkedin/draft`, {
        lead_name: lead.name, lead_role: lead.role, lead_company: lead.company
      })
      setLinkedin(res.data.message)
    } catch {
      setLinkedin(`Hey ${lead.name.split(' ')[0]}, sent you an email about ${lead.company}. Worth connecting?`)
    }
    setLiLoading(false)
  }

  const fireSignal = async (type) => {
    try { await axios.post(`${API}/signals/trigger`, { lead_id: lead.id || lead.name, signal_type: type }) }
    catch {}
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!lead) return null

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      <div className='flex-1 bg-black/50' onClick={onClose} />
      <div className='w-[480px] bg-gray-950 border-l border-purple-800 overflow-y-auto flex flex-col'>

        {/* Header */}
        <div className='p-5 border-b border-gray-800 flex items-start justify-between'>
          <div>
            <h2 className='text-white font-bold text-xl'>{lead.name}</h2>
            <p className='text-gray-400 text-sm'>{lead.role} at {lead.company}</p>
            <div className='flex gap-2 mt-2'>
              <span className={`text-xs px-2 py-1 rounded-full border ${persona.border} ${persona.color} ${persona.bg}`}>
                {persona.label}
              </span>
              <span className='text-xs px-2 py-1 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700'>
                Score: {lead.score || 50}
              </span>
            </div>
          </div>
          <button onClick={onClose} className='text-gray-500 hover:text-white text-2xl leading-none'>✕</button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-800'>
          {['profile', 'email', 'linkedin', 'signals'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors
                ${tab === t ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className='p-5 flex-1 space-y-4'>

          {/* PROFILE */}
          {tab === 'profile' && (
            <div className='space-y-4'>
              {lead.hook && (
                <div className='bg-purple-900/20 border border-purple-800 rounded-xl p-4'>
                  <p className='text-purple-400 text-xs font-bold mb-1'>🎯 CONVERSATION HOOK</p>
                  <p className='text-white text-sm italic'>{lead.hook}</p>
                </div>
              )}
              {lead.pain_points?.length > 0 && (
                <div className='bg-gray-900 border border-gray-800 rounded-xl p-4'>
                  <p className='text-red-400 text-xs font-bold mb-2'>😰 PAIN POINTS</p>
                  {lead.pain_points.map((pt, i) => (
                    <p key={i} className='text-gray-300 text-sm py-1 border-b border-gray-800 last:border-0'>• {pt}</p>
                  ))}
                </div>
              )}
              {lead.approach && (
                <div className='bg-gray-900 border border-gray-800 rounded-xl p-4'>
                  <p className='text-yellow-400 text-xs font-bold mb-1'>💡 RECOMMENDED APPROACH</p>
                  <p className='text-gray-300 text-sm'>{lead.approach}</p>
                </div>
              )}
              <div className='bg-gray-900 border border-gray-800 rounded-xl p-4'>
                <p className='text-gray-500 text-xs font-bold mb-3'>📊 LEAD INFO</p>
                {[['Industry', lead.industry || 'Technology'], ['Status', lead.status || 'pending'], ['Email', lead.email || '—']].map(([k, v]) => (
                  <div key={k} className='flex justify-between py-1 border-b border-gray-800 last:border-0'>
                    <span className='text-gray-500 text-sm'>{k}</span>
                    <span className='text-white text-sm capitalize'>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMAIL */}
          {tab === 'email' && (
            <div className='space-y-4'>
              {!message ? (
                <button onClick={generateEmail} disabled={genLoading}
                  className='w-full bg-purple-700 hover:bg-purple-600 py-3 rounded-xl font-bold disabled:opacity-50'>
                  {genLoading ? '⟳ Generating...' : '✉️ Generate Email with AI'}
                </button>
              ) : (
                <div className='space-y-3'>
                  <MirrorPanel lead={lead} message={message} onApproved={setMessage} />
                  <div className='bg-gray-900 rounded-xl p-4 border border-gray-800'>
                    <div className='flex justify-between items-center mb-2'>
                      <p className='text-gray-500 text-xs font-bold'>FINAL MESSAGE</p>
                      <button onClick={() => copy(message)}
                        className='text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg'>
                        {copied ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <p className='text-gray-300 text-sm whitespace-pre-line'>{message}</p>
                  </div>
                  <button onClick={generateEmail}
                    className='w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-xl text-sm text-gray-400'>
                    ↺ Regenerate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LINKEDIN */}
          {tab === 'linkedin' && (
            <div className='space-y-4'>
              <div className='bg-blue-900/20 border border-blue-800 rounded-xl p-4'>
                <p className='text-blue-400 text-xs font-bold mb-1'>💼 LINKEDIN FALLBACK</p>
                <p className='text-gray-400 text-xs'>Used when email goes unanswered for 3+ days.</p>
              </div>
              {!linkedin ? (
                <button onClick={generateLinkedIn} disabled={liLoading}
                  className='w-full bg-blue-700 hover:bg-blue-600 py-3 rounded-xl font-bold disabled:opacity-50'>
                  {liLoading ? '⟳ Drafting...' : '💼 Draft LinkedIn Message'}
                </button>
              ) : (
                <div className='space-y-3'>
                  <div className='bg-gray-900 border border-blue-800 rounded-xl p-4'>
                    <p className='text-blue-400 text-xs font-bold mb-2'>MESSAGE ({linkedin.length} chars)</p>
                    <p className='text-white text-sm italic'>"{linkedin}"</p>
                  </div>
                  <button onClick={() => copy(linkedin)}
                    className='w-full bg-blue-800 hover:bg-blue-700 py-2 rounded-xl text-sm font-bold'>
                    {copied ? '✅ Copied!' : '📋 Copy to LinkedIn'}
                  </button>
                  <button onClick={generateLinkedIn}
                    className='w-full bg-gray-800 hover:bg-gray-700 py-2 rounded-xl text-sm text-gray-400'>
                    ↺ Regenerate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SIGNALS */}
          {tab === 'signals' && (
            <div className='space-y-3'>
              <p className='text-gray-500 text-xs'>Manually fire a signal for this lead.</p>
              {[
                { type: 'opened', label: '👁️ Opened Email', color: 'bg-blue-700 hover:bg-blue-600' },
                { type: 'clicked', label: '🔗 Clicked Link', color: 'bg-purple-700 hover:bg-purple-600' },
                { type: 'cold', label: '💤 Gone Cold', color: 'bg-gray-700 hover:bg-gray-600' },
                { type: 'replied', label: '↩️ Replied', color: 'bg-green-700 hover:bg-green-600' },
              ].map(s => (
                <button key={s.type} onClick={() => fireSignal(s.type)}
                  className={`w-full ${s.color} py-3 rounded-xl font-bold text-sm`}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}