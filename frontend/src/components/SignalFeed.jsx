import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'

const SIGNAL_COLORS = {
  Opened:    { text: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-700', dot: '🟣' },
  Clicked:   { text: 'text-blue-400',   bg: 'bg-blue-900/20',   border: 'border-blue-700',   dot: '🔵' },
  Replied:   { text: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-700',  dot: '🟢' },
  'Gone Cold':{ text: 'text-gray-400',  bg: 'bg-gray-900/20',   border: 'border-gray-700',   dot: '⚫' },
  Bounced:   { text: 'text-red-400',    bg: 'bg-red-900/20',    border: 'border-red-700',    dot: '🔴' },
  Manual:    { text: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700', dot: '🟡' },
}

export default function SignalFeed() {
  const [signals, setSignals] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await axios.get(`${API}/signals/feed`)
        setSignals(res.data.signals || [])
        setConnected(true)
      } catch {
        setConnected(false)
      }
    }

    poll() // immediate first load
    const interval = setInterval(poll, 2000) // poll every 2 seconds
    return () => clearInterval(interval)
  }, [])

  const clearFeed = async () => {
    try {
      await axios.delete(`${API}/signals/clear`)
      setSignals([])
    } catch {}
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}
            style={{ boxShadow: connected ? '0 0 8px #34d399' : '0 0 8px #f87171', animation: connected ? 'pulse 1.5s infinite' : 'none' }} />
          <span className="text-gray-400 text-xs font-mono uppercase tracking-widest">
            {connected ? 'LIVE — polling every 2s' : 'DISCONNECTED'}
          </span>
        </div>
        {signals.length > 0 && (
          <button onClick={clearFeed}
            className="text-xs text-gray-600 hover:text-red-400 font-mono uppercase tracking-wide transition-colors">
            Clear Feed
          </button>
        )}
      </div>

      {/* Empty state */}
      {signals.length === 0 && (
        <div className="border border-gray-800 rounded-xl p-8 text-center space-y-2">
          <p className="text-4xl">⚡</p>
          <p className="text-gray-500 text-sm font-mono">No signals yet</p>
          <p className="text-gray-700 text-xs">Fire a signal from a lead's detail panel to see it appear here</p>
        </div>
      )}

      {/* Signal events */}
      <div className="space-y-2">
        {signals.map((s, i) => {
          const style = SIGNAL_COLORS[s.signal_type] || SIGNAL_COLORS.Manual
          return (
            <div key={s.id || i}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${style.bg} ${style.border}`}
              style={{ animation: i === 0 ? 'fadeIn 0.3s ease' : 'none' }}>
              <div className="flex items-center gap-3">
                <span className="text-base">{style.dot}</span>
                <div>
                  <span className={`text-sm font-bold ${style.text}`}>{s.signal_type}</span>
                  <span className="text-gray-400 text-sm"> — {s.lead_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-xs font-mono">{s.timestamp}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${style.border} ${style.text} font-mono`}>
                  #{s.id}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  )
}