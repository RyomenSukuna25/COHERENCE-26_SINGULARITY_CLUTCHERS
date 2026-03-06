import { Handle, Position } from "reactflow"

export default function MirrorNode() {

    return (

        <div style={{
            padding: "12px",
            border: "1px solid #888",
            borderRadius: "8px",
            background: "#ede7f6",
            minWidth: "140px",
            textAlign: "center"
        }}>

            <Handle type="target" position={Position.Top} />

            🪞 Mirror Simulation

            <Handle type="source" position={Position.Bottom} />

        </div>

    )

}