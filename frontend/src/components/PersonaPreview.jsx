import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'
const PERSONAS = [
  { key: 'arjun', label: '🔴 Arjun', type: 'The Closer', color: 'border-red-700 bg-red-900/20', badge: 'text-red-400' },
  { key: 'priya', label: '🟡 Priya', type: 'The Nurturer', color: 'border-yellow-700 bg-yellow-900/20', badge: 'text-yellow-400' },
  { key: 'dev', label: '🔵 Dev', type: 'The Analyst', color: 'border-blue-700 bg-blue-900/20', badge: 'text-blue-400' },
]

export default function PersonaPreview({ lead }) {
  const [messages, setMessages] = useState({})
  const [loading, setLoading] = useState(false)

  const generateAll = async () => {
    setLoading(true)
    const results = {}
    for (const p of PERSONAS) {
      try {
        const res = await axios.post(`${API}/messages/generate`, {
          lead_name: lead.name, lead_company: lead.company,
          lead_role: lead.role, persona: p.key
        })
        results[p.key] = res.data.message
      } catch {
        results[p.key] = `Hi ${lead.name}, reaching out about ${lead.company}...`
      }
    }
    setMessages(results)
    setLoading(false)
  }

  return (
    <div className='bg-gray-900 rounded-xl p-5 border border-purple-800'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl'>👤</span>
          <h3 className='text-purple-400 font-bold text-lg'>PERSONA PREVIEW</h3>
        </div>
        <button onClick={generateAll} disabled={loading}
          className='bg-purple-700 hover:bg-purple-600 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-bold transition-all'>
          {loading ? '⟳ Generating all 3...' : '▶ Generate All 3 Personas'}
        </button>
      </div>
      <p className='text-gray-500 text-sm mb-4'>Same lead. Same product. 3 completely different humans.</p>
      <div className='grid grid-cols-3 gap-4'>
        {PERSONAS.map(p => (
          <div key={p.key} className={`rounded-xl p-4 border ${p.color}`}>
            <p className={`font-bold text-sm mb-1 ${p.badge}`}>{p.label}</p>
            <p className='text-gray-500 text-xs mb-3'>{p.type}</p>
            {messages[p.key]
              ? <p className='text-gray-300 text-xs leading-relaxed'>{messages[p.key]}</p>
              : <p className='text-gray-600 text-xs italic'>Click generate to see {p.label}'s email</p>
            }
          </div>
        ))}
      </div>
    </div>
  )
}