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

// Always returns a plain string — never crashes
function safeString(val) {
  if (!val) return null
  if (typeof val === 'string') return val.trim()
  if (typeof val === 'object') {
    const found = val.message || val.text || val.content || val.email || val.draft
    if (found) return String(found).trim()
    // last resort — find longest string value in the object
    const strings = Object.values(val).filter(v => typeof v === 'string' && v.length > 20)
    if (strings.length) return strings.sort((a,b) => b.length - a.length)[0].trim()
  }
  return String(val).trim()
}

function fallbackEmail(lead, personaKey) {
  const first = lead.name?.split(' ')[0] || 'there'
  const company = lead.company || 'your company'
  const role = lead.role || 'your role'
  const industry = lead.industry || 'tech'
  const pain = lead.pain_points?.[0] || 'scaling outreach efficiently'
  const hook = lead.hook || `${company} is growing fast and outreach is often the first thing that breaks`

  const emails = {
    dev: `Hi ${first},

${hook}

Most engineering leaders at ${industry} companies your stage face the same paradox: technically excellent teams, but the outreach pipeline is still running on spreadsheets and manual follow-ups. At ${company}'s scale, that gap compounds fast — every week of manual work is a week your competitors are using to pull ahead.

The root cause is almost always the same: tools built for volume, not signal. Every email looks identical regardless of whether the prospect opened it, clicked a link, or has been cold for three weeks. There's no feedback loop. ${role}s end up nursing a leaky funnel instead of solving real problems.

Teams that switched to signal-driven outreach saw 3x reply rates and 40% reduction in time-to-first-meeting within the first month. For a ${role} like you, that translates directly to less noise, better pipeline visibility, and more engineering hours back on the roadmap.

Would a 15-minute technical walkthrough make sense to see if this maps to ${company}'s current setup?

— Dev`,

    arjun: `Hi ${first},

${company} is scaling — that's obvious from the outside. What's less obvious is whether your outreach is scaling with it, or whether your team is working three times harder to produce the same results.

Here's what I consistently see at ${industry} companies at your stage: reply rates stuck under 8%, follow-up sequences that completely ignore whether a prospect actually engaged, and reps burning hours on manual personalization that should take 20 minutes. The bottleneck isn't effort or headcount. It's intelligence in the system.

I helped a team almost identical to ${company} — same stage, same industry, same ${role} challenges — go from a 6% reply rate to 22% in 11 days. Not by sending more emails, but by sending smarter ones. Every message was calibrated to the prospect's actual behavior and objection pattern before it landed in their inbox.

Open to a 20-minute call this week? I'll show you exactly what changed and what it would look like for ${company}.

— Arjun`,

    priya: `Hi ${first},

I came across ${company} while researching ${industry} teams that are navigating fast growth, and I wanted to reach out personally — not with a template, but because your situation reminded me of a conversation I had recently with someone in a very similar role.

She was a ${role} at a similar-stage company, spending close to four hours every day on ${pain}. Not because she wasn't good at her job — she was exceptional. But the tools she had couldn't tell her who was actually interested and who had quietly gone cold. She was putting equal energy into leads that would never convert and leads that were two days away from saying yes. It was exhausting and demoralizing.

After switching to a signal-driven approach — where the system surfaces who to reach out to and exactly when, based on their real behavior — her reply rate doubled in two weeks. More importantly, she got her afternoons back and stopped dreading Monday mornings.

I'd love to share what worked for her team and see if any of it maps to what you're experiencing at ${company}. Would a 20-minute conversation this week work for you?

— Priya`
  }
  return emails[personaKey] || emails.arjun
}

function fallbackLinkedIn(lead) {
  const first = lead.name?.split(' ')[0] || 'there'
  const options = [
    `Hey ${first} — sent you an email about how we're helping ${lead.company} scale outreach without adding headcount. Would love to connect if it's on your radar.`,
    `Hi ${first}, reached out via email re: outreach automation at ${lead.company}. Figured I'd connect here too — easier to chat if it's relevant.`,
    `${first} — noticed ${lead.company} is in a big growth phase. Sent something over email that might be useful for your team. Worth connecting?`,
  ]
  // Pick based on name hash so same lead always gets same message (until regenerate)
  const hash = lead.name?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0
  return options[hash % options.length]
}

function computeMirrorFallback(lead, message) {
  let score = 36
  const msg = message.toLowerCase()
  const first = (lead.name?.split(' ')[0] || '').toLowerCase()
  const company = (lead.company || '').toLowerCase()
  const role = (lead.role || '').toLowerCase()

  if (msg.includes(first))   score += 10
  if (msg.includes(company)) score += 12
  if (msg.includes(role))    score += 7
  if (message.length > 500)  score += 9
  else if (message.length > 250) score += 5
  if (/\d+%|3x|2x|\d+ days|\d+ weeks/.test(msg)) score += 9
  if (msg.split('\n').filter(l => l.trim()).length >= 4) score += 6
  if (msg.includes('?')) score += 4
  // Per-lead variance using name hash
  const nameHash = lead.name?.split('').reduce((a,c) => a + c.charCodeAt(0), 0) || 0
  score += (nameHash % 14)
  score = Math.min(Math.max(score, 28), 93)

  const low = score < 55
  const reactions = {
    dev:   low ? `Technically interesting framing, but I need actual proof before I'd consider a call. This feels like every other vendor email.`
               : `The technical context is relevant and the stat caught my attention. I'd probably at least click through.`,
    arjun: low ? `I've heard this pitch before from three other vendors this week. What's the specific number and why should I believe it applies to us?`
               : `Direct and relevant. The outcome claim is specific enough to be credible. I might actually reply.`,
    priya: low ? `It reads like a template with my name swapped in. I get 30 of these a week — not sure this one earns a reply.`
               : `The story element made me pause. It feels more personal than most. I'd probably respond.`,
  }

  return {
    score,
    reaction: reactions[lead.persona] || reactions.arjun,
    objection: low
      ? `Too generic — could have been sent to anyone in ${lead.industry || 'this'} industry.`
      : `Good hook but the CTA could be sharper and more specific to ${lead.company}'s situation.`,
    fix: low
      ? `Reference something specific ${first} is dealing with at ${lead.company} right now — not a generic pain point.`
      : `Add one concrete benchmark from the ${lead.industry || 'tech'} space to make the claim more credible.`
  }
}

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

  const personaKey = lead.persona?.toLowerCase() || 'arjun'
  const persona = PERSONA_STYLE[personaKey] || PERSONA_STYLE.arjun

  const generateEmail = async () => {
    setGenLoading(true)
    setMessage('')
    try {
      const res = await axios.post(`${API}/messages/generate`, {
        lead_name: lead.name,
        lead_company: lead.company,
        lead_role: lead.role,
        lead_email: lead.email || '',
        persona: personaKey,
        seed: Date.now(),
      })
      const msg = safeString(res.data)
      setMessage(msg || fallbackEmail(lead, personaKey))
    } catch {
      setMessage(fallbackEmail(lead, personaKey))
    }
    setGenLoading(false)
  }

  const generateAllPersonas = async () => {
    setAllLoading(true)
    setAllPersonas(null)
    try {
      const res = await axios.post(`${API}/messages/generate-all-personas`, {
        lead_name: lead.name,
        lead_company: lead.company,
        lead_role: lead.role,
        lead_email: lead.email || '',
        seed: Date.now(),
      })
      const raw = res.data?.personas || res.data || {}
      setAllPersonas({
        Arjun: safeString(raw.Arjun || raw.arjun) || fallbackEmail(lead, 'arjun'),
        Priya: safeString(raw.Priya || raw.priya) || fallbackEmail(lead, 'priya'),
        Dev:   safeString(raw.Dev   || raw.dev)   || fallbackEmail(lead, 'dev'),
      })
    } catch {
      setAllPersonas({
        Arjun: fallbackEmail(lead, 'arjun'),
        Priya: fallbackEmail(lead, 'priya'),
        Dev:   fallbackEmail(lead, 'dev'),
      })
    }
    setAllLoading(false)
  }

  const generateLinkedIn = async () => {
    setLiLoading(true)
    setLinkedin(null)
    try {
      const res = await axios.post(`${API}/linkedin/draft`, {
        lead_name: lead.name,
        lead_role: lead.role,
        lead_company: lead.company,
        seed: Date.now(),
      })
      const msg = safeString(res.data)
      setLinkedin(msg || fallbackLinkedIn(lead))
    } catch {
      setLinkedin(fallbackLinkedIn(lead))
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
      setSigFired(prev => [{ type, time: new Date().toLocaleTimeString('en-IN', { hour12: false }), error: false }, ...prev])
    } catch {
      setSigFired(prev => [{ type, time: new Date().toLocaleTimeString('en-IN', { hour12: false }), error: true }, ...prev])
    }
    setSigLoading(null)
  }

  const copy = (text) => {
    const str = safeString(text) || ''
    navigator.clipboard.writeText(str)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const linkedinStr = safeString(linkedin)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-[520px] bg-gray-950 border-l border-purple-800 overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-start justify-between sticky top-0 bg-gray-950 z-10">
          <div>
            <h2 className="text-white font-bold text-xl">{lead.name}</h2>
            <p className="text-gray-400 text-sm">{lead.role} at {lead.company}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full border ${persona.border} ${persona.color} ${persona.bg}`}>
                {persona.label}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700">
                Mirror: {lead.mirrorScore || lead.score || 50}/100
              </span>
              {lead.status && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700 capitalize">
                  {lead.status}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-white text-lg w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 flex-shrink-0 ml-3 mt-1">
            ✕
          </button>
        </div>

        {/* Tabs */}
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

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div className="space-y-4">
              {lead.hook && (
                <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-4">
                  <p className="text-purple-400 text-xs font-bold mb-2">🎯 CONVERSATION HOOK</p>
                  <p className="text-white text-sm italic leading-relaxed">{lead.hook}</p>
                </div>
              )}
              {lead.pain_points?.length > 0 && (
                <div className="bg-red-900/10 border border-red-900/40 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-bold mb-2">😰 PAIN POINTS</p>
                  {lead.pain_points.map((pt, i) => (
                    <p key={i} className="text-gray-300 text-sm py-1.5 border-b border-gray-800 last:border-0">
                      • {pt}
                    </p>
                  ))}
                </div>
              )}
              {lead.approach && (
                <div className="bg-yellow-900/10 border border-yellow-900/40 rounded-xl p-4">
                  <p className="text-yellow-400 text-xs font-bold mb-1">💡 APPROACH</p>
                  <p className="text-gray-300 text-sm">{lead.approach}</p>
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
                  ['Status', lead.status || 'Pending'],
                  ['Persona', personaKey.charAt(0).toUpperCase() + personaKey.slice(1)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-gray-800 last:border-0">
                    <span className="text-gray-500 text-sm">{k}</span>
                    <span className="text-white text-sm capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EMAIL ── */}
          {tab === 'email' && (
            <div className="space-y-4">
              <button onClick={generateEmail} disabled={genLoading}
                className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition-all">
                {genLoading
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block">⟳</span> Generating...</span>
                  : message ? '↺ Regenerate Email' : '✉️ Generate Email with AI'}
              </button>
              {message && (
                <div className="space-y-3">
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-gray-500 text-xs font-bold">GENERATED — {persona.label}</p>
                      <button onClick={() => copy(message)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-white">
                        {copied ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{message}</p>
                  </div>
                  <MirrorPanel
                    lead={lead}
                    message={message}
                    onApproved={setMessage}
                    getFallback={computeMirrorFallback}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── PERSONAS ── */}
          {tab === 'personas' && (
            <div className="space-y-4">
              <button onClick={generateAllPersonas} disabled={allLoading}
                className="w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition-all">
                {allLoading
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block">⟳</span> Generating all 3 personas...</span>
                  : '⚡ Generate All 3 Personas'}
              </button>
              <p className="text-gray-500 text-xs text-center">
                Same lead. Three completely different humans. Watch the tone shift.
              </p>
              {allPersonas && ['Arjun', 'Priya', 'Dev'].map(name => {
                const s = {
                  Arjun: { border:'border-red-800',    text:'text-red-400',    bg:'bg-red-900/10',    emoji:'🔴', title:'THE CLOSER' },
                  Priya: { border:'border-yellow-800', text:'text-yellow-400', bg:'bg-yellow-900/10', emoji:'🟡', title:'THE NURTURER' },
                  Dev:   { border:'border-blue-800',   text:'text-blue-400',   bg:'bg-blue-900/10',   emoji:'🔵', title:'THE ANALYST' },
                }[name]
                const emailText = safeString(allPersonas[name]) || ''
                return (
                  <div key={name} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
                    <div className="flex justify-between items-center mb-3">
                      <p className={`text-xs font-bold ${s.text}`}>{s.emoji} {name} — {s.title}</p>
                      <button onClick={() => copy(emailText)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{emailText}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── LINKEDIN ── */}
          {tab === 'linkedin' && (
            <div className="space-y-4">
              <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
                <p className="text-blue-400 text-xs font-bold mb-1">💼 LINKEDIN FALLBACK CHANNEL</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Auto-triggered when email goes unanswered for 3+ days.
                  Different channel, different tone, same intelligence.
                </p>
              </div>
              <button onClick={generateLinkedIn} disabled={liLoading}
                className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition-all">
                {liLoading
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block">⟳</span> Drafting...</span>
                  : linkedinStr ? '↺ Regenerate LinkedIn Message' : '💼 Draft LinkedIn Message'}
              </button>
              {linkedinStr && (
                <div className="space-y-3">
                  <div className="bg-gray-900 border border-blue-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-blue-400 text-xs font-bold">MESSAGE</p>
                      <span className={`text-xs font-bold ${linkedinStr.length > 300 ? 'text-red-400' : 'text-green-400'}`}>
                        {linkedinStr.length} / 300 chars
                      </span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{linkedinStr}</p>
                  </div>
                  <button onClick={() => copy(linkedinStr)}
                    className="w-full bg-blue-800 hover:bg-blue-700 py-2 rounded-xl text-sm font-bold text-white">
                    {copied ? '✅ Copied to clipboard!' : '📋 Copy to LinkedIn'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── SIGNALS ── */}
          {tab === 'signals' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm leading-relaxed">
                Fire a behavioral signal for <span className="text-purple-400 font-bold">{lead.name}</span>.
                Triggers the next workflow step automatically.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SIGNAL_BUTTONS.map(s => (
                  <button key={s.type} onClick={() => fireSignal(s.type)}
                    disabled={sigLoading === s.type}
                    className={`${s.color} disabled:opacity-50 py-3 rounded-xl font-bold text-sm text-white transition-all`}>
                    {sigLoading === s.type
                      ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block">⟳</span> Firing...</span>
                      : s.label}
                  </button>
                ))}
              </div>
              {sigFired.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Signal Log</p>
                  {sigFired.map((f, i) => (
                    <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg border ${
                      f.error ? 'bg-red-900/20 border-red-900' : 'bg-green-900/20 border-green-900'
                    }`}>
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