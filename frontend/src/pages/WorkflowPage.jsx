import { useCallback, useState } from 'react'
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

const nodeStyle = (color, glow) => ({
  background: `rgba(${color},0.08)`,
  border: `1px solid rgba(${color},0.4)`,
  borderRadius: 12,
  padding: '12px 18px',
  minWidth: 180,
  fontFamily: 'JetBrains Mono, monospace',
  boxShadow: `0 0 20px rgba(${color},0.15)`,
  color: '#e2e8f0',
})

const PURPLE = '168,85,247'
const GREEN  = '34,197,94'
const CYAN   = '6,182,212'
const AMBER  = '245,158,11'
const RED    = '239,68,68'

const initialNodes = [
  // ENTRY
  {
    id: '1',
    type: 'input',
    position: { x: 340, y: 20 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>📊</div>
          <div style={{ color: '#a855f7', fontWeight: 700, fontSize: 12 }}>LEAD UPLOAD</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Excel / CSV → NEXUS</div>
        </div>
      )
    },
    style: nodeStyle(PURPLE),
  },

  // ENRICHMENT
  {
    id: '2',
    position: { x: 340, y: 140 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>🧠</div>
          <div style={{ color: '#a855f7', fontWeight: 700, fontSize: 12 }}>AI ENRICHMENT</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Pain points · Hook · Score</div>
        </div>
      )
    },
    style: nodeStyle(PURPLE),
  },

  // PERSONA ASSIGN
  {
    id: '3',
    position: { x: 340, y: 260 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>👤</div>
          <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: 12 }}>PERSONA ASSIGN</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Arjun · Priya · Dev</div>
        </div>
      )
    },
    style: nodeStyle(CYAN),
  },

  // MIRROR CHECK
  {
    id: '4',
    position: { x: 340, y: 380 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>🪞</div>
          <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: 12 }}>MIRROR CHECK</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Score email 0–100</div>
        </div>
      )
    },
    style: nodeStyle(CYAN),
  },

  // SCORE GATE
  {
    id: '5',
    position: { x: 340, y: 500 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12 }}>◆ SCORE GATE</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 4 }}>Score ≥ 70?</div>
        </div>
      )
    },
    style: { ...nodeStyle(AMBER), minWidth: 140 },
  },

  // AUTO FIX (low score branch)
  {
    id: '6',
    position: { x: 100, y: 620 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>✨</div>
          <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12 }}>AUTO-FIX</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Rewrite + Re-score</div>
        </div>
      )
    },
    style: nodeStyle(AMBER),
  },

  // SEND EMAIL (high score branch)
  {
    id: '7',
    position: { x: 560, y: 620 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>✉️</div>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 12 }}>SEND EMAIL</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>via SendGrid</div>
        </div>
      )
    },
    style: nodeStyle(GREEN),
  },

  // SIGNAL MONITOR
  {
    id: '8',
    position: { x: 560, y: 740 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>📡</div>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 12 }}>SIGNAL MONITOR</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Opened · Clicked · Cold</div>
        </div>
      )
    },
    style: nodeStyle(GREEN),
  },

  // SIGNAL BRANCH
  {
    id: '9',
    position: { x: 560, y: 860 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#a855f7', fontWeight: 700, fontSize: 12 }}>◆ SIGNAL GATE</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 4 }}>Replied / Opened / Cold?</div>
        </div>
      )
    },
    style: { ...nodeStyle(PURPLE), minWidth: 160 },
  },

  // REPLIED
  {
    id: '10',
    type: 'output',
    position: { x: 800, y: 980 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>🎯</div>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 12 }}>REPLIED</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Book call · Close deal</div>
        </div>
      )
    },
    style: nodeStyle(GREEN),
  },

  // LINKEDIN FALLBACK
  {
    id: '11',
    position: { x: 320, y: 980 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>💼</div>
          <div style={{ color: '#2563eb', fontWeight: 700, fontSize: 12 }}>LINKEDIN FALLBACK</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Auto-draft connection msg</div>
        </div>
      )
    },
    style: nodeStyle('37,99,235'),
  },

  // FOLLOW UP
  {
    id: '12',
    position: { x: 560, y: 980 },
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, marginBottom: 4 }}>🔄</div>
          <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12 }}>FOLLOW-UP</div>
          <div style={{ color: '#4b5563', fontSize: 10, marginTop: 2 }}>Day 3 · Day 7 · Day 14</div>
        </div>
      )
    },
    style: nodeStyle(AMBER),
  },
]

const edgeStyle = (color, label) => ({
  animated: true,
  style: { stroke: `rgba(${color},0.6)`, strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: `rgba(${color},0.8)` },
  label,
  labelStyle: { fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' },
  labelBgStyle: { fill: '#0d1117', fillOpacity: 0.9 },
})

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', ...edgeStyle(PURPLE, '') },
  { id: 'e2-3', source: '2', target: '3', ...edgeStyle(PURPLE, 'enriched') },
  { id: 'e3-4', source: '3', target: '4', ...edgeStyle(CYAN, 'assigned') },
  { id: 'e4-5', source: '4', target: '5', ...edgeStyle(CYAN, 'scored') },
  { id: 'e5-6', source: '5', target: '6', ...edgeStyle(AMBER, '< 70'), sourceHandle: null },
  { id: 'e5-7', source: '5', target: '7', ...edgeStyle(GREEN, '≥ 70') },
  { id: 'e6-4', source: '6', target: '4', ...edgeStyle(AMBER, 'retry'), type: 'smoothstep' },
  { id: 'e7-8', source: '7', target: '8', ...edgeStyle(GREEN, 'sent') },
  { id: 'e8-9', source: '8', target: '9', ...edgeStyle(GREEN, 'signal') },
  { id: 'e9-10', source: '9', target: '10', ...edgeStyle(GREEN, 'replied') },
  { id: 'e9-11', source: '9', target: '11', ...edgeStyle('37,99,235', 'cold 3d+') },
  { id: 'e9-12', source: '9', target: '12', ...edgeStyle(AMBER, 'opened') },
  { id: 'e12-8', source: '12', target: '8', ...edgeStyle(AMBER, 'loop'), type: 'smoothstep' },
]

export default function WorkflowPage({ leads = [] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  return (
    <div style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: '#e2e8f0', fontSize: 15, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
          Workflow Canvas
        </p>
        <p style={{ color: '#374151', fontSize: 11, marginTop: 2 }}>
          8-node outreach automation · Upload → Enrich → Mirror → Send → Signal → Close
        </p>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 10, padding: '10px 16px',
      }}>
        {[
          ['#a855f7', 'AI Layer'],
          ['#06b6d4', 'Mirror Layer'],
          ['#22c55e', 'Execution Layer'],
          ['#f59e0b', 'Decision Gate'],
          ['#2563eb', 'LinkedIn Layer'],
        ].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ color: '#6b7280', fontSize: 10 }}>{label}</span>
          </div>
        ))}
        <span style={{ color: '#374151', fontSize: 10, marginLeft: 'auto' }}>
          Drag nodes · Scroll to zoom · Click to select
        </span>
      </div>

      {/* Canvas */}
      <div style={{
        height: 680,
        background: '#080b11',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color='rgba(168,85,247,0.08)' gap={24} size={1} />
          <Controls style={{
            background: 'rgba(13,17,23,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
          }} />
          <MiniMap
            nodeColor={(n) => {
              const label = n.data?.label?.props?.children?.[1]?.props?.children || ''
              if (label.includes('ENRICH') || label.includes('UPLOAD') || label.includes('PERSONA')) return '#a855f7'
              if (label.includes('MIRROR') || label.includes('SCORE')) return '#06b6d4'
              if (label.includes('SEND') || label.includes('SIGNAL') || label.includes('REPLIED')) return '#22c55e'
              if (label.includes('FIX') || label.includes('FOLLOW')) return '#f59e0b'
              if (label.includes('LINKEDIN')) return '#2563eb'
              return '#374151'
            }}
            style={{
              background: 'rgba(13,17,23,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 14,
      }}>
        {[
          { label: 'Nodes', value: '12', color: '#a855f7' },
          { label: 'Active Sequences', value: '3', color: '#22c55e' },
          { label: 'Leads in Flow', value: String(leads.length || 50), color: '#06b6d4' },
          { label: 'Auto-Decisions/day', value: '120+', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10, padding: '12px 16px',
          }}>
            <p style={{ color: '#4b5563', fontSize: 10, marginBottom: 4 }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}