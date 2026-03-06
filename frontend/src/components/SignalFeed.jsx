import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'
const ICONS = { opened:'👁️', clicked:'🔗', cold:'💤', replied:'↩️', bounced:'🚫', manual:'🖐️' }
const COLORS = { opened:'text-blue-400', clicked:'text-purple-400', cold:'text-gray-400', replied:'text-green-400', bounced:'text-red-400', manual:'text-yellow-400' }

export default function SignalFeed() {
  const [signals, setSignals] = useState([])
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/signals/feed`)
        if (res.data.length !== signals.length) setPulse(true)
        setSignals(res.data.slice(0, 12))
        setTimeout(() => setPulse(false), 600)
      } catch {}
    }, 3000)
    return () => clearInterval(poll)
  }, [signals.length])

  const manual = async () => {
    await axios.post(`${API}/signals/trigger`, { lead_id: 'demo-lead', signal_type: 'manual' }).catch(() => {})
  }

  return (
    <div className='bg-gray-900 rounded-xl p-5 border border-purple-800'>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-2'>
          <span className={`w-2 h-2 rounded-full bg-green-400 ${pulse ? 'animate-ping' : 'animate-pulse'}`} />
          <h3 className='text-purple-400 font-bold'>⚡ SIGNAL FEED</h3>
          <span className='text-gray-600 text-xs'>LIVE</span>
        </div>
        <button onClick={manual}
          className='bg-gray-800 hover:bg-purple-800 border border-gray-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors'>
          🖐️ Fire Signal
        </button>
      </div>
      <div className='space-y-2 max-h-64 overflow-y-auto'>
        {signals.length === 0 && (
          <div className='text-center py-8'>
            <p className='text-4xl mb-2'>📡</p>
            <p className='text-gray-600 text-sm'>Waiting for signals...</p>
          </div>
        )}
        {signals.map((s, i) => (
          <div key={i} className='flex items-center gap-3 p-3 bg-gray-800 rounded-lg transition-colors'>
            <span className='text-xl'>{ICONS[s.signal_type] || '⚡'}</span>
            <div className='flex-1 min-w-0'>
              <p className='text-sm text-white truncate'>
                {s.lead_id}
                <span className={`ml-2 ${COLORS[s.signal_type] || 'text-white'}`}>{s.signal_type}</span>
              </p>
              <p className='text-xs text-gray-500'>{s.timestamp?.slice(11, 19) || 'just now'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}