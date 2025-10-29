import React from "react";

const Clients = () => {
  const clients = [
    { name: "Aens Engineering", status: "Active" },
    { name: "TechCore Ltd", status: "Pending" },
    { name: "BuildRight Co", status: "Active" },
    { name: "Structura", status: "Inactive" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white p-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Clients</h1>

        <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="p-4">Client Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-800 transition duration-200"
                >
                  <td className="p-4">{client.name}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        client.status === "Active"
                          ? "bg-green-700 text-green-200"
                          : client.status === "Pending"
                          ? "bg-yellow-700 text-yellow-200"
                          : "bg-red-700 text-red-200"
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
