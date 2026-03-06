import { Handle, Position } from "reactflow"

export default function ConditionNode() {

    return (

        <div style={{
            padding: "10px",
            border: "1px solid #888",
            borderRadius: "8px",
            background: "#e8f5e9",
            minWidth: "120px",
            textAlign: "center"
        }}>

            <Handle type="target" position={Position.Top} />

            🔀 Condition

            <Handle type="source" position={Position.Bottom} />

        </div>

    )

}