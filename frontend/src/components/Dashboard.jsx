export default function Dashboard({ leads }) {

  const total = leads.length

  const personas = {}

  leads.forEach(l => {
    personas[l.persona] = (personas[l.persona] || 0) + 1
  })

  return (

    <div style={{marginTop:"40px"}}>

      <h2>📊 Mission Control</h2>

      <div style={{display:"flex",gap:"40px"}}>

        <div style={{border:"1px solid gray",padding:"20px"}}>
          <h3>Total Leads</h3>
          <p>{total}</p>
        </div>

        <div style={{border:"1px solid gray",padding:"20px"}}>
          <h3>Persona Distribution</h3>

          {Object.entries(personas).map(([p,c])=>(
            <p key={p}>{p} : {c}</p>
          ))}

        </div>

      </div>

    </div>
  )
}

