export default function WorkflowControls({ addNode, saveWorkflow }) {

    return (

        <div style={{ marginBottom: "10px" }}>

            <button onClick={() => addNode("sendNode")}>
                Send Email
            </button>

            <button onClick={() => addNode("delayNode")}>
                Delay
            </button>

            <button onClick={() => addNode("conditionNode")}>
                Condition
            </button>

            <button onClick={() => addNode("exitNode")}>
                Exit
            </button>

            <button onClick={saveWorkflow}>
                Save Workflow
            </button>

            <button onClick={() => addNode("mirrorNode")}>
                Mirror Simulation
            </button>

            <button onClick={() => addNode("personaNode")}>
                Persona
            </button>

            <button onClick={() => addNode("retryNode")}>
                Retry
            </button>

        </div>

    )

}