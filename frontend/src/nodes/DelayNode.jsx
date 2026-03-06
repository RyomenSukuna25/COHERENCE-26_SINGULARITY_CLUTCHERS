import { Handle, Position } from "reactflow"

export default function DelayNode() {

    return (

        <div style={{
            padding: "10px",
            border: "1px solid #888",
            borderRadius: "8px",
            background: "#fff3cd",
            minWidth: "120px",
            textAlign: "center"
        }}>

            <Handle type="target" position={Position.Top} />

            ⏳ Delay

            <Handle type="source" position={Position.Bottom} />

        </div>

    )

}