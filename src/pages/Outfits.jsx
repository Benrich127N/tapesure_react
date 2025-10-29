const Outfits = () => {
  const outfitStats = [
    { title: "Total Outfits", value: "6,784", color: "text-indigo-400", sub: "+15 today" },
    { title: "In Progress", value: "4,412", color: "text-yellow-400", sub: "+4 today" },
    { title: "Delivered", value: "1,920", color: "text-green-400", sub: "+2 today" },
    { title: "Delayed", value: "329", color: "text-red-400", sub: "+1 today" },
  ];

  const outfitCards = [
    { client: "Sarah Johnson", type: "Ankara Gown", status: "In Progress", color: "yellow", progress: "65%", due: "Oct 25" },
    { client: "John Doe", type: "Senator Suit", status: "Delivered", color: "green", progress: "100%", due: "Oct 15" },
    { client: "Chika Ndu", type: "Wedding Dress", status: "Delayed", color: "red", progress: "40%", due: "Oct 30" },
    { client: "Mary Afolabi", type: "Office Skirt", status: "Pending", color: "gray", progress: "0%", due: "Oct 28" },
  ];

  return (
    <div className="space-y-8 w-full bg-black min-h-screen p-8 -m-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-white">Outfit Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {outfitStats.map((stat) => (
          <div key={stat.title} className="bg-gray-900 rounded-xl shadow-lg p-5 border border-gray-800">
            <h2 className="text-gray-400 text-sm">{stat.title}</h2>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Outfit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {outfitCards.map((outfit) => (
          <div key={outfit.client} className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-300">{outfit.type}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${outfit.color}-900 text-${outfit.color}-400 border border-${outfit.color}-700`}>
                {outfit.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Client: {outfit.client}</p>
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
              <div
                className={`bg-${outfit.color}-500 h-2.5 rounded-full`}
                style={{ width: outfit.progress }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">Due: {outfit.due} • Progress: {outfit.progress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Outfits;
