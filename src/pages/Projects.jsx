const Projects = () => {
  const projectStats = [
    { title: "Total Projects", value: "6,784", color: "text-indigo-400", sub: "+150 today" },
    { title: "In Progress", value: "4,412", color: "text-yellow-400", sub: "+150 today" },
    { title: "Completed", value: "1,920", color: "text-green-400", sub: "+150 today" },
    { title: "Blocked", value: "329", color: "text-red-400", sub: "+150 today" },
  ];

  const projectCards = [
    { name: "Education Platform", status: "Draft", color: "gray", progress: "0%" },
    { name: "Template Design", status: "In Progress", color: "yellow", progress: "50%" },
    { name: "Website Redesign", status: "Completed", color: "green", progress: "100%" },
    { name: "Marketing Project", status: "Blocked", color: "red", progress: "10%" },
    { name: "Rebranding", status: "In Progress", color: "yellow", progress: "50%" },
    { name: "Internal CMS Tools", status: "Completed", color: "green", progress: "100%" },
  ];

  return (
    <div className="space-y-8 w-full bg-black min-h-full p-8 -m-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white">Project Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {projectStats.map((stat) => (
          <div key={stat.title} className="bg-gray-900 rounded-xl shadow-lg p-5 border border-gray-800">
            <h2 className="text-gray-400 text-sm">{stat.title}</h2>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {projectCards.map((project) => (
          <div key={project.name} className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-300">{project.name}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${project.color}-900 text-${project.color}-400 border border-${project.color}-700`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
              <div
                className={`bg-${project.color}-500 h-2.5 rounded-full`}
                style={{ width: project.progress }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">Progress: {project.progress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;