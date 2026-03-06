import { useState } from "react";

export default function LeadUpload({ onLeadsLoaded }) {

  const [loading, setLoading] = useState(false);

  const handleFile = () => {

    setLoading(true);

    const fakeLeads = [
      {name:"Rahul Sharma", company:"TechCorp", role:"CTO", persona:"dev"},
      {name:"Priya Mehta", company:"StartupX", role:"CEO", persona:"arjun"},
      {name:"Dev Patel", company:"EnterpriseY", role:"Manager", persona:"priya"}
    ];

    setTimeout(() => {
      onLeadsLoaded(fakeLeads);
      setLoading(false);
    }, 1000);

  };

  return (
    <div style={{border:"2px dashed gray", padding:"40px"}}>
      <button onClick={handleFile}>Load Demo Leads</button>
      {loading && <p>Analyzing leads...</p>}
    </div>
  );
}