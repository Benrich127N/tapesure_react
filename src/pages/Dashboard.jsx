// src/pages/Dashboard.jsx
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/Card";
import ProjectTable from "../components/ProjectTable";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Project Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Project" value="6,784" change="+150 today ↑" trendColor="text-green-600" />
        <StatCard title="In Progress" value="4,412" change="+150 today ↑" trendColor="text-blue-600" />
        <StatCard title="Completed" value="1,920" change="+150 today ↑" trendColor="text-green-600" />
        <StatCard title="Blocked" value="140" change="+50 today ↓" trendColor="text-red-600" />
      </div>

      <ProjectTable />
    </DashboardLayout>
  );
};

export default Dashboard;
