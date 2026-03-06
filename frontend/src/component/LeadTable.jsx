export default function LeadTable({ leads = [] }) {

  if (!leads || leads.length === 0) {
    return <p>No leads loaded yet</p>;
  }

  return (
    <table border="1" cellPadding="10">

      <thead>
        <tr>
          <th>Name</th>
          <th>Company</th>
          <th>Role</th>
          <th>Persona</th>
        </tr>
      </thead>

      <tbody>
        {leads.map((lead,i)=>(
          <tr key={i}>
            <td>{lead.name}</td>
            <td>{lead.company}</td>
            <td>{lead.role}</td>
            <td>{lead.persona}</td>
          </tr>
        ))}
      </tbody>

    </table>
  );
}