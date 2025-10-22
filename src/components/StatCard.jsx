// src/components/StatCard.jsx
const StatCard = ({ title, value, change, trendColor }) => {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
      <p className={`text-sm mt-1 ${trendColor}`}>{change}</p>
    </div>
  );
};

export default StatCard;
