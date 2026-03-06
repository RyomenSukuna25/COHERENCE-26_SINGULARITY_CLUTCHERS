import { Handle, Position } from "reactflow"

export default function SendNode({ data }) {

    return (

        <div style={{
            padding: "10px",
            border: "1px solid #888",
            borderRadius: "8px",
            background: "#e3f2fd",
            minWidth: "120px",
            textAlign: "center"
        }}>

            <Handle type="target" position={Position.Top} />

            📧 Send Email

            <Handle type="source" position={Position.Bottom} />

        </div>

    )

}