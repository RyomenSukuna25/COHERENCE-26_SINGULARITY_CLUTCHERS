import { Handle, Position } from "reactflow"

export default function RetryNode() {

    return (

        <div style={{
            padding: "12px",
            border: "1px solid #888",
            borderRadius: "8px",
            background: "#fff8e1",
            minWidth: "140px",
            textAlign: "center"
        }}>

            <Handle type="target" position={Position.Top} />

            🔁 Retry

            <Handle type="source" position={Position.Bottom} />

        </div>

    )

}