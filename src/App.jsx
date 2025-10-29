import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Footer from "./components/Footer";
import Outfits from "./pages/Outfits";
import Settings from "./pages/Settings";


function App() {
  return (
    <Router>
      <div className="flex h-screen bg-black text-gray-900">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 p-6 overflow-auto bg-black">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/outfits" element={<Outfits />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/invoices" element={<Invoices />} />
               <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;