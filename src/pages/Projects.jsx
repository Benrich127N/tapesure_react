import React from "react";

const Projects = () => {
  return (
    <div className="flex min-h-screen bg-black text-white p-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((project) => (
            <div
              key={project}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg hover:shadow-2xl transition duration-300"
            >
              <h2 className="text-xl font-semibold text-indigo-400">
                Project {project}
              </h2>
              <p className="text-gray-400 mt-2">Engineering design and build project #{project}</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
