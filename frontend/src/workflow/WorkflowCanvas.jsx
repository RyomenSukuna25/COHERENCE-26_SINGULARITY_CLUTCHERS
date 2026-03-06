import ReactFlow,
{
    Background,
    Controls,
    MiniMap
} from "reactflow"

import "reactflow/dist/style.css"
import MirrorNode from "../nodes/MirrorNode"
import PersonaNode from "../nodes/PersonaNode"
import RetryNode from "../nodes/RetryNode"
import SendNode from "../nodes/SendNode"
import DelayNode from "../nodes/DelayNode"
import ConditionNode from "../nodes/ConditionNode"
import ExitNode from "../nodes/ExitNode"

const nodeTypes = {

    sendNode: SendNode,
    delayNode: DelayNode,
    conditionNode: ConditionNode,
    exitNode: ExitNode,
    mirrorNode: MirrorNode,
    personaNode: PersonaNode,
    retryNode: RetryNode


}

export default function WorkflowCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect }) {

    return (

        <div style={{ height: "600px", border: "1px solid #ccc" }}>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
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

    )

}