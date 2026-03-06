import { useState } from 'react'
import axios from 'axios'
import MirrorPanel from './MirrorPanel'

const API = 'http://localhost:8000/api'

const PERSONA_STYLE = {
  arjun: { color: 'text-red-400', border: 'border-red-700', bg: 'bg-red-900/20', label: '🔴 Arjun — The Closer' },
  priya: { color: 'text-yellow-400', border: 'border-yellow-700', bg: 'bg-yellow-900/20', label: '🟡 Priya — The Nurturer' },
  dev:   { color: 'text-blue-400',  border: 'border-blue-700',  bg: 'bg-blue-900/20',  label: '🔵 Dev — The Analyst' },
}

const SIGNAL_BUTTONS = [
  { type: 'Opened',    label: '👁️ Opened Email',  color: 'bg-blue-700 hover:bg-blue-600' },
  { type: 'Clicked',   label: '🔗 Clicked Link',   color: 'bg-purple-700 hover:bg-purple-600' },
  { type: 'Gone Cold', label: '💤 Gone Cold',       color: 'bg-gray-700 hover:bg-gray-600' },
  { type: 'Replied',   label: '↩️ Replied',         color: 'bg-green-700 hover:bg-green-600' },
  { type: 'Bounced',   label: '⛔ Bounced',         color: 'bg-red-700 hover:bg-red-600' },
  { type: 'Manual',    label: '⚡ Manual Trigger',  color: 'bg-yellow-700 hover:bg-yellow-600' },
]

export default function LeadDetail({ lead, onClose }) {
  const [tab, setTab] = useState('profile')
  const [message, setMessage] = useState('')
  const [allPersonas, setAllPersonas] = useState(null)
  const [linkedin, setLinkedin] = useState(null)
  const [genLoading, setGenLoading] = useState(false)
  const [allLoading, setAllLoading] = useState(false)
  const [liLoading, setLiLoading] = useState(false)
  const [sigLoading, setSigLoading] = useState(null)
  const [sigFired, setSigFired] = useState([])
  const [copied, setCopied] = useState(false)

  if (!lead) return null

  const persona = PERSONA_STYLE[lead.persona?.toLowerCase()] || PERSONA_STYLE.arjun

  const generateEmail = async () => {
    setGenLoading(true)
    try {
      const res = await axios.post(`${API}/messages/generate`, {
        lead_name: lead.name,
        lead_company: lead.company,
        lead_role: lead.role,
        lead_email: lead.email || '',
        persona: lead.persona || null,
      })
      setMessage(res.data.message)
    } catch {
      setMessage(`Hi ${lead.name},\n\nI came across ${lead.company} and wanted to reach out about how we help ${lead.role}s scale their outreach.\n\nWorth a quick chat?\n\n— NEXUS Team`)
    }
    setGenLoading(false)
  }

  const generateAllPersonas = async () => {
    setAllLoading(true)
    try {
      const res = await axios.post(`${API}/messages/generate-all-personas`, {
        lead_name: lead.name,
        lead_company: lead.company,
        lead_role: lead.role,
        lead_email: lead.email || '',
      })
      setAllPersonas(res.data.personas)
    } catch {
      setAllPersonas({
        Arjun: `Hi ${lead.name},\n\nCompanies like ${lead.company} are leaving revenue on the table. Our platform delivers 3x reply rates.\n\n15 minutes this week?\n\n— Arjun`,
        Priya: `Hi ${lead.name},\n\nI came across ${lead.company} and was impressed. I'd love to share how we've helped similar teams.\n\nWould you be open to a quick chat?\n\n— Priya`,
        Dev:   `Hi ${lead.name},\n\nHow is ${lead.company} handling outreach sequencing? Most ${lead.role} teams lose 40% deliverability on timer-based delays.\n\n— Dev`,
      })
    }
    setAllLoading(false)
  }

  const generateLinkedIn = async () => {
    setLiLoading(true)
    try {
      const res = await axios.post(`${API}/linkedin/draft`, {
        lead_name: lead.name,
        lead_role: lead.role,
        lead_company: lead.company,
        lead_email: lead.email || '',
      })
      setLinkedin(res.data.message)
    } catch {
      setLinkedin(`Hey ${lead.name.split(' ')[0]}, sent you an email about how we help ${lead.role}s at companies like ${lead.company}. Worth connecting?`)
    }
    setLiLoading(false)
  }

  const fireSignal = async (type) => {
    setSigLoading(type)
    try {
      await axios.post(`${API}/signals/trigger`, {
        lead_id: String(lead.id || lead.name),
        lead_name: lead.name,
        signal_type: type,
      })
      setSigFired(prev => [{ type, time: new Date().toLocaleTimeString('en-IN', { hour12: false }) }, ...prev])
    } catch {
      setSigFired(prev => [{ type, time: new Date().toLocaleTimeString('en-IN', { hour12: false }), error: true }, ...prev])
    }
    setSigLoading(null)
  }

  const copy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-[520px] bg-gray-950 border-l border-purple-800 overflow-y-auto flex flex-col">

        <div className="p-5 border-b border-gray-800 flex items-start justify-between sticky top-0 bg-gray-950 z-10">
          <div>
            <h2 className="text-white font-bold text-xl">{lead.name}</h2>
            <p className="text-gray-400 text-sm">{lead.role} at {lead.company}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full border ${persona.border} ${persona.color} ${persona.bg}`}>
                {persona.label}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700">
                Score: {lead.mirrorScore || lead.score || 50}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 flex-shrink-0 ml-3 mt-1"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-gray-800">
          {['profile', 'email', 'personas', 'linkedin', 'signals'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                tab === t ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-5 flex-1 space-y-4">

          {tab === 'profile' && (
            <div className="space-y-4">
              {lead.hook && (
                <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-4">
                  <p className="text-purple-400 text-xs font-bold mb-1">🎯 CONVERSATION HOOK</p>
                  <p className="text-white text-sm italic">{lead.hook}</p>
                </div>
              )}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs font-bold mb-3">📊 LEAD INFO</p>
                {[
                  ['Name', lead.name],
                  ['Role', lead.role],
                  ['Company', lead.company],
                  ['Industry', lead.industry || 'Technology'],
                  ['Email', lead.email || '—'],
                  ['Stage', lead.stage || 'Pending'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-gray-800 last:border-0">
                    <span className="text-gray-500 text-sm">{k}</span>
                    <span className="text-white text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'email' && (
            <div className="space-y-4">
              <button onClick={generateEmail} disabled={genLoading}
                className="w-full bg-purple-700 hover:bg-purple-600 py-3 rounded-xl font-bold disabled:opacity-50 text-white transition-all">
                {genLoading ? '⟳ Generating...' : message ? '↺ Regenerate Email' : '✉️ Generate Email with AI'}
              </button>
              {message && (
                <div className="space-y-3">
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-500 text-xs font-bold">GENERATED MESSAGE</p>
                      <button onClick={() => copy(message)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-white">
                        {copied ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{message}</p>
                  </div>
                  <MirrorPanel lead={lead} message={message} onApproved={setMessage} />
                </div>
              )}
            </div>
          )}

          {tab === 'personas' && (
            <div className="space-y-4">
              <button onClick={generateAllPersonas} disabled={allLoading}
                className="w-full bg-purple-700 hover:bg-purple-600 py-3 rounded-xl font-bold disabled:opacity-50 text-white transition-all">
                {allLoading ? '⟳ Generating all 3 personas...' : '⚡ Generate All 3 Personas'}
              </button>
              <p className="text-gray-500 text-xs text-center">Same lead. Three different humans. Watch the difference.</p>
              {allPersonas && ['Arjun', 'Priya', 'Dev'].map(name => {
                const styles = {
                  Arjun: { border: 'border-red-700',    text: 'text-red-400',    emoji: '🔴', title: 'THE CLOSER' },
                  Priya: { border: 'border-yellow-700', text: 'text-yellow-400', emoji: '🟡', title: 'THE NURTURER' },
                  Dev:   { border: 'border-blue-700',   text: 'text-blue-400',   emoji: '🔵', title: 'THE ANALYST' },
                }
                const s = styles[name]
                return (
                  <div key={name} className={`bg-gray-900 border ${s.border} rounded-xl p-4`}>
                    <div className="flex justify-between items-center mb-3">
                      <p className={`text-xs font-bold ${s.text}`}>{s.emoji} {name.toUpperCase()} — {s.title}</p>
                      <button onClick={() => copy(allPersonas[name])}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{allPersonas[name]}</p>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'linkedin' && (
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
                <p className="text-blue-400 text-xs font-bold mb-1">💼 LINKEDIN FALLBACK</p>
                <p className="text-gray-400 text-xs">Auto-triggered when email goes unanswered for 3+ days.</p>
              </div>
              <button onClick={generateLinkedIn} disabled={liLoading}
                className="w-full bg-blue-700 hover:bg-blue-600 py-3 rounded-xl font-bold disabled:opacity-50 text-white transition-all">
                {liLoading ? '⟳ Drafting...' : linkedin ? '↺ Regenerate' : '💼 Draft LinkedIn Message'}
              </button>
              {linkedin && (
                <div className="space-y-3">
                  <div className="bg-gray-900 border border-blue-800 rounded-xl p-4">
                    <p className="text-blue-400 text-xs font-bold mb-2">MESSAGE ({linkedin.length} chars)</p>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-line">{linkedin}</p>
                  </div>
                  <button onClick={() => copy(linkedin)}
                    className="w-full bg-blue-800 hover:bg-blue-700 py-2 rounded-xl text-sm font-bold text-white">
                    {copied ? '✅ Copied!' : '📋 Copy to LinkedIn'}
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'signals' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Fire a behavioral signal for <span className="text-purple-400 font-bold">{lead.name}</span>. Triggers the next workflow step instantly.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SIGNAL_BUTTONS.map(s => (
                  <button key={s.type} onClick={() => fireSignal(s.type)}
                    disabled={sigLoading === s.type}
                    className={`${s.color} disabled:opacity-50 py-3 rounded-xl font-bold text-sm text-white transition-all`}>
                    {sigLoading === s.type ? '⟳ Firing...' : s.label}
                  </button>
                ))}
              </div>
              {sigFired.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">Fired Signals</p>
                  {sigFired.map((f, i) => (
                    <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg border ${f.error ? 'bg-red-900/20 border-red-800' : 'bg-green-900/20 border-green-800'}`}>
                      <span className={`text-sm font-bold ${f.error ? 'text-red-400' : 'text-green-400'}`}>
                        {f.error ? '❌' : '✅'} {f.type}
                      </span>
                      <span className="text-gray-500 text-xs">{f.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}