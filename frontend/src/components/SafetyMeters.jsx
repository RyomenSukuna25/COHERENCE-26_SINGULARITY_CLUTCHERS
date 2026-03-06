import { useState } from 'react'

function Meter({ label, value, max, unit }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : 'bg-green-500'
  const textColor = pct > 80 ? 'text-red-400' : pct > 60 ? 'text-yellow-400' : 'text-green-400'
  return (
    <div className='mb-4'>
      <div className='flex justify-between text-sm mb-2'>
        <span className='text-gray-400'>{label}</span>
        <span className={`font-bold ${textColor}`}>{value}{unit} / {max}{unit}</span>
      </div>
      <div className='w-full bg-gray-800 rounded-full h-2.5'>
        <div className={`${color} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function SafetyMeters() {
  const [paused, setPaused] = useState(false)
  return (
    <div className='bg-gray-900 rounded-xl p-5 border border-purple-800'>
      <h3 className='text-purple-400 font-bold mb-5'>🛡️ SAFETY CONTROLS</h3>
      <Meter label='Emails / Hour' value={23} max={50} unit='' />
      <Meter label='Bounce Rate' value={3} max={10} unit='%' />
      <Meter label='Daily Volume' value={145} max={200} unit='' />
      <Meter label='Spam Score' value={12} max={100} unit='' />
      <button onClick={() => setPaused(!paused)}
        className={`w-full mt-2 py-3 rounded-xl font-bold text-white transition-all
          ${paused ? 'bg-green-700 hover:bg-green-600' : 'bg-red-700 hover:bg-red-600'}`}>
        {paused ? '▶ Resume NEXUS' : '⏸ Pause All Sending'}
      </button>
      {paused && (
        <p className='text-yellow-400 text-xs text-center mt-2 animate-pulse'>⚠️ All outreach paused</p>
      )}
    </div>
  )
}