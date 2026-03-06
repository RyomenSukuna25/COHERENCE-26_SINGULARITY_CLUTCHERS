import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'

export default function MirrorPanel({ lead, message, onApproved }) {
  const [result, setResult] = useState(null)
  const [improved, setImproved] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [newScore, setNewScore] = useState(null)

  const runMirror = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/mirror/simulate`, {
        lead_name: lead.name, lead_role: lead.role,
        lead_company: lead.company, message
      })
      setResult(res.data)
    } catch {
      setResult({
        reaction: 'Could not simulate — backend offline.',
        score: 45, objection: 'Unknown', fix: 'Check backend connection'
      })
    }
    setLoading(false)
  }

  const applyFix = async () => {
    setFixing(true)
    try {
      const fixRes = await axios.post(`${API}/mirror/fix`, {
        lead_name: lead.name, lead_role: lead.role,
        lead_company: lead.company, message, fix: result.fix
      })
      const improved_msg = fixRes.data.message
      setImproved(improved_msg)
      const scoreRes = await axios.post(`${API}/mirror/simulate`, {
        lead_name: lead.name, lead_role: lead.role,
        lead_company: lead.company, message: improved_msg
      })
      setNewScore(scoreRes.data.score)
      onApproved && onApproved(improved_msg)
    } catch {}
    setFixing(false)
  }

  const scoreColor = (s) => s >= 70 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400'
  const scoreBg = (s) => s >= 70 ? 'bg-green-900/30 border-green-700' : s >= 50 ? 'bg-yellow-900/30 border-yellow-700' : 'bg-red-900/30 border-red-700'
  const scoreLabel = (s) => s >= 70 ? '✅ He would reply' : s >= 50 ? '🤔 Maybe — needs work' : '🗑️ He would delete this'

  return (
    <div className='bg-gray-900 rounded-xl p-5 border border-purple-800'>
      <div className='flex items-center gap-2 mb-4'>
        <span className='text-2xl'>🪞</span>
        <h3 className='text-purple-400 font-bold text-lg'>MIRROR</h3>
        <span className='text-gray-500 text-xs ml-auto'>Prospect simulation</span>
      </div>

      <div className='bg-gray-800 rounded-lg p-3 mb-4'>
        <p className='text-gray-500 text-xs mb-1'>Email to simulate</p>
        <p className='text-gray-300 text-sm line-clamp-3'>{message}</p>
      </div>

      {!result && (
        <button onClick={runMirror} disabled={loading}
          className='w-full bg-purple-700 hover:bg-purple-600 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition-all'>
          {loading
            ? <span className='flex items-center justify-center gap-2'><span className='animate-spin'>⟳</span> Simulating {lead.name}...</span>
            : '▶ Simulate Prospect Reaction'}
        </button>
      )}

      {result && (
        <div className='space-y-3'>
          <div className={`rounded-xl p-4 border ${scoreBg(result.score)}`}>
            <div className='flex items-center gap-4'>
              <div className='text-center min-w-16'>
                <p className={`text-5xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
                <p className='text-gray-500 text-xs'>/ 100</p>
              </div>
              <div>
                <p className={`font-bold text-sm ${scoreColor(result.score)}`}>{scoreLabel(result.score)}</p>
                <p className='text-gray-400 text-xs mt-1'>Reply probability</p>
              </div>
            </div>
          </div>

          <div className='bg-gray-800 rounded-lg p-3'>
            <p className='text-gray-500 text-xs mb-1'>💭 {lead.name} is thinking...</p>
            <p className='text-white text-sm italic'>"{result.reaction}"</p>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div className='bg-red-900/20 border border-red-900 rounded-lg p-3'>
              <p className='text-red-400 text-xs font-bold mb-1'>❌ Objection</p>
              <p className='text-gray-300 text-xs'>{result.objection}</p>
            </div>
            <div className='bg-yellow-900/20 border border-yellow-900 rounded-lg p-3'>
              <p className='text-yellow-400 text-xs font-bold mb-1'>⚡ Fix</p>
              <p className='text-gray-300 text-xs'>{result.fix}</p>
            </div>
          </div>

          {!improved && result.score < 70 && (
            <button onClick={applyFix} disabled={fixing}
              className='w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 py-3 rounded-xl font-bold text-white text-sm transition-all'>
              {fixing
                ? <span className='flex items-center justify-center gap-2'><span className='animate-spin'>⟳</span> Applying fix...</span>
                : '✨ Auto-Fix & Regenerate Message'}
            </button>
          )}

          {improved && (
            <div className='space-y-2'>
              <div className='bg-green-900/20 border border-green-700 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <p className='text-green-400 text-xs font-bold'>✅ Improved Message</p>
                  {newScore && (
                    <span className={`text-lg font-bold ${scoreColor(newScore)}`}>{newScore}/100</span>
                  )}
                </div>
                <p className='text-gray-300 text-sm'>{improved}</p>
              </div>
              <button onClick={() => onApproved && onApproved(improved)}
                className='w-full bg-green-700 hover:bg-green-600 py-2 rounded-xl font-bold text-white text-sm'>
                ✅ Use This Message
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}