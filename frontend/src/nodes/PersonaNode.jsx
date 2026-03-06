import { Handle, Position } from "reactflow"

export default function PersonaNode() {

    return (

        <div style={{
            padding: "12px",
            border: "1px solid #888",
            borderRadius: "8px",
            background: "#e0f7fa",
            minWidth: "140px",
            textAlign: "center"
        }}>

            <Handle type="target" position={Position.Top} />

            👤 Assign Persona

            <Handle type="source" position={Position.Bottom} />

        </div>

    )

}