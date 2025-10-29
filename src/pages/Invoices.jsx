import React from "react";

const Invoices = () => {
  const invoices = [
    { id: "INV-001", client: "Aens Engineering", amount: "$5,000", status: "Paid" },
    { id: "INV-002", client: "TechCore Ltd", amount: "$2,300", status: "Pending" },
    { id: "INV-003", client: "Structura", amount: "$1,800", status: "Overdue" },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white p-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Invoices</h1>

        <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Client</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-800 transition duration-200"
                >
                  <td className="p-4">{inv.id}</td>
                  <td className="p-4">{inv.client}</td>
                  <td className="p-4">{inv.amount}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        inv.status === "Paid"
                          ? "bg-green-700 text-green-200"
                          : inv.status === "Pending"
                          ? "bg-yellow-700 text-yellow-200"
                          : "bg-red-700 text-red-200"
                      }`}
                    >
                      {inv.status}
                    </span>
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

export default Invoices;
