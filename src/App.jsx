import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "../firebase";

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



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <Login />
      ) : (
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
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/outfits/new" element={<AddOutfit />} />
                <Route path="/outfits/:id" element={<OutfitDetails />} />
                <Route path="/calendar" element={<CalendarPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
