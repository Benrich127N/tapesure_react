// src/components/ProjectTable.jsx
const ProjectTable = () => {
  const projects = [
    { name: "Education Platform", client: "Oksy.co", due: "24 Feb 2024", budget: "$40,000", status: "In Progress" },
    { name: "Template Design", client: "Target", due: "24 Feb 2024", budget: "$40,000", status: "In Progress" },
    { name: "Website Redesign", client: "4Square", due: "24 Feb 2024", budget: "$40,000", status: "Draft" },
    { name: "Marketing Project", client: "Odoble", due: "24 Feb 2024", budget: "$40,000", status: "Blocked" },
    { name: "Rebranding", client: "Loopline", due: "24 Feb 2024", budget: "$40,000", status: "Completed" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress": return "bg-yellow-100 text-yellow-700";
      case "Completed": return "bg-green-100 text-green-700";
      case "Blocked": return "bg-red-100 text-red-700";
      case "Draft": return "bg-gray-200 text-gray-600";
      default: return "";
    }
  };

  return (
    <div className="bg-white mt-8 rounded-xl shadow overflow-hidden">
      <table className="w-full border-collapse text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4">Project Name</th>
            <th className="p-4">Client</th>
            <th className="p-4">Due Date</th>
            <th className="p-4">Budget</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="p-4">{p.name}</td>
              <td className="p-4">{p.client}</td>
              <td className="p-4">{p.due}</td>
              <td className="p-4 font-semibold">{p.budget}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(p.status)}`}>
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
