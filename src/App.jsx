import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "../firebase";
import UpdatePrompt from "./components/UpdatePrompt"; // Add this

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";

import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Outfits from "./pages/Outfits";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import AddOutfit from "./pages/AddOutfit";
import OutfitDetails from "./pages/OutfitDetails";
import CalendarPage from "./pages/CalendarPage.jsx";
import ClientDetails from "./pages/ClientDetails";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import Measurements from "./pages/Measurements.jsx";
import InstallPrompt from "./components/InstallPrompt";



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Add this

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
     <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-indigo-950">
  <div className="text-center">
    {/* Spinning Logo */}
    <div className="relative mb-6">
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto">
        <img 
          src="/logo.png" 
          alt="Loading" 
          className="w-full h-full object-contain animate-pulse"
        />
      </div>
      {/* Spinning Circle */}
      <div className="absolute inset-0 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
    
    {/* Text */}
    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
      Tape<span className="text-indigo-400">Sure</span>
    </h2>
    <p className="text-sm text-gray-400 animate-pulse">Loading your workspace...</p>
  </div>
</div>
    );
  }

  return (
    <Router>
      {!user ? (
        <Login />
      ) : (
        <div className="flex h-screen bg-black text-gray-900">
          <Sidebar
            mobileOpen={mobileMenuOpen}
            setMobileOpen={setMobileMenuOpen}
          />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
            <main className="flex-1 p-6 overflow-auto bg-black">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/outfits" element={<Outfits />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/outfits/new" element={<AddOutfit />} />
                <Route path="/outfits/:id" element={<OutfitDetails />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/clients/:id" element={<ClientDetails />} />
                <Route path="/invoices/new" element={<CreateInvoice />} />
                <Route path="/invoices/:id" element={<InvoiceDetails />} />
                <Route path="/measurements" element={<Measurements />} />

              </Routes>
            </main>
            <Footer />
            <InstallPrompt />
                      <UpdatePrompt /> {/* Add this */}

          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
