import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar stays fixed on the left */}
        <Sidebar />

        {/* Main area fills the rest of the screen */}
        <div className="flex flex-col flex-1">
          <main className="flex-grow p-6 bg-black">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/invoices" element={<Invoices />} />
            </Routes>
          </main>

          {/* Footer sticks to the bottom of the main area */}
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
