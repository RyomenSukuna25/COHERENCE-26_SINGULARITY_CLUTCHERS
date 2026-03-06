import { useCallback } from "react"
import { useNodesState, useEdgesState, addEdge } from "reactflow"
import WorkflowCanvas from "../workflow/WorkflowCanvas"
import WorkflowControls from "../workflow/WorkflowControls"

export default function WorkflowBuilder() {

    const [nodes, setNodes, onNodesChange] = useNodesState([
        {
            id: "start",
            type: "input",
            data: { label: "Start" },
            position: { x: 250, y: 50 }
        }
    ])

    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

    const addNode = (type) => {

        const newNode = {
            id: String(nodes.length + 1),
            type: type,
            position: {
                x: Math.random() * 400,
                y: Math.random() * 400
            },
            data: { label: type }
        }

        setNodes([...nodes, newNode])

    }

    return (

        <div style={{ padding: "40px" }}>

            <h2>⚙ Workflow Builder</h2>

            <WorkflowControls addNode={addNode} />

            <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
            />

        </div>

    )

}