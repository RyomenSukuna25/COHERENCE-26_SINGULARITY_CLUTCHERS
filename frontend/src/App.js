import { useState } from "react"
import LeadUpload from "./components/LeadUpload"
import LeadTable from "./components/LeadTable"

export default function App(){

  const [leads,setLeads] = useState([])

  return (

    <div style={{padding:"40px"}}>

      <h1>⚡ NEXUS Lead Manager</h1>

      <LeadUpload onLeadsLoaded={setLeads}/>

      <br/>

      <LeadTable leads={leads}/>

    </div>

  )
}