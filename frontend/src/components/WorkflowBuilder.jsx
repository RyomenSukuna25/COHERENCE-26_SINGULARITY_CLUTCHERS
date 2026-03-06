import React, { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from "reactflow";

import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 250, y: 5 }
  }
];

const initialEdges = [];

export default function WorkflowBuilder() {

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = (type) => {

    const newNode = {
      id: `${nodes.length + 1}`,
      data: { label: type },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400
      }
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const saveWorkflow = () => {

    const workflow = {
      nodes,
      edges
    };

    console.log("Workflow JSON:", workflow);

    alert("Workflow saved! Check console.");
  };

  return (

    <div style={{ height: "600px", border: "1px solid #ddd" }}>

      <h2>⚙ Workflow Builder</h2>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => addNode("Send Email")}>
          ➕ Send Email
        </button>

        <button onClick={() => addNode("Delay")}>
          ⏳ Wait
        </button>

        <button onClick={() => addNode("Exit")}>
          🚪 Exit
        </button>

        <button onClick={saveWorkflow}>
          💾 Save Workflow
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

    </div>
  );
}