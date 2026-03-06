import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'

// TEMPORARY — skip login for now, go straight to dashboard
// Jay will add Firebase config later
export default function App() {
  return <Dashboard user={{ displayName: 'Chirag' }} />
}