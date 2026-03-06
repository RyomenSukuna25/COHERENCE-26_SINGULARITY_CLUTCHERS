import { Handle, Position } from "reactflow"

export default function ExitNode() {

    return (

        <div style={{
            padding: "10px",
            border: "1px solid #888",
            borderRadius: "8px",
            background: "#ffcdd2",
            minWidth: "120px",
            textAlign: "center"
        }}>

            <Handle type="target" position={Position.Top} />

            🚪 Exit

        </div>

    )

}