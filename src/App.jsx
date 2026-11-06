import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { auth, db } from "../firebase";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import { RouteFocus, SkipToContent } from "./components/WorkspaceNavigation";

import Onboarding from "./pages/Onboarding";
import ProfileRecovery from "./components/ProfileRecovery";
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
import MilestoneCelebration from "./components/MilestoneCelebration";



function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [profileAttempt, setProfileAttempt] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Add this

  useEffect(() => {
    let unsubscribeProfile;
    let active = true;
    let profileRequest = 0;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!active) return;
      const request = ++profileRequest;
      setUser(currentUser);
      setProfileError(false);

      if (unsubscribeProfile) unsubscribeProfile();

      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubscribeProfile = onSnapshot(
        doc(db, "users", currentUser.uid),
        { includeMetadataChanges: true },
        (snapshot) => {
          if (!active || request !== profileRequest || snapshot.metadata?.hasPendingWrites) return;
          setProfileError(false);
          setUserProfile(snapshot.exists() ? snapshot.data() : null);
          setLoading(false);
        },
        (error) => {
          if (!active || request !== profileRequest) return;
          console.error("Unable to load shop profile:", error);
          setProfileError(true);
          setLoading(false);
        },
      );
    });

    return () => {
      active = false;
      unsubscribe();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [profileAttempt]);

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
      ) : profileError ? (
        <ProfileRecovery user={user} onRetry={() => setProfileAttempt(value => value + 1)} />
      ) : !userProfile?.onboardingCompleted || !userProfile?.shopName?.trim() ? (
        <Routes>
          <Route path="/onboarding" element={<Onboarding key={user.uid} profile={userProfile} onComplete={profile => { setUserProfile(profile); setProfileError(false); }} />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      ) : (
        <div className="app-shell flex h-dvh bg-gray-950 text-gray-100">
          <RouteFocus focusOnMount />
          <SkipToContent />
          <Sidebar
            accountName={userProfile.fullName ?? user.displayName}
            mobileOpen={mobileMenuOpen}
            setMobileOpen={setMobileMenuOpen}
          />
          <div className="flex min-w-0 flex-col flex-1 overflow-hidden">
            <Topbar accountName={userProfile.fullName ?? user.displayName} onMenuClick={() => setMobileMenuOpen(true)} mobileMenuOpen={mobileMenuOpen} />
            <main id="workspace-content" tabIndex={-1} aria-label="Workspace content" className="workspace-main flex-1 min-w-0 overflow-auto bg-gray-950 p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/signup" element={<Navigate to="/" replace />} />
                <Route path="/" element={<Dashboard shopName={userProfile.shopName} />} />
                <Route path="/outfits" element={<Outfits />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/onboarding" element={<Navigate to="/outfits/new" replace />} />
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
            <MilestoneCelebration />
            <InstallPrompt />
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
