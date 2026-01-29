// src/pages/Onboarding.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Scissors, Store, Phone, ArrowRight } from "lucide-react";

const Onboarding = () => {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        
        // Update the document with the business details
        await updateDoc(userRef, {
          shopName: shopName,
          phone: phone,
          onboardingCompleted: true,
          subscriptionPlan: "free",
          createdAt: serverTimestamp(), // Setting the formal start date
        });

        navigate("/"); // Redirect to dashboard
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-full mb-4">
            <Scissors className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Setup Your Shop</h1>
          <p className="text-gray-400">Tell us a bit about your tailoring business to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Shop Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-600" />
              </div>
              <input
                required
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Ben Couture"
                className="block w-full pl-10 pr-3 py-3 bg-black border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-600" />
              </div>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09063420516"
                className="block w-full pl-10 pr-3 py-3 bg-black border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-200 
              ${loading ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95'}
            `}
          >
            {loading ? "Saving..." : "Start Managing Projects"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-600 uppercase tracking-widest font-semibold">
          Tapsure Engine 56c5d
        </p>
      </div>
    </div>
  );
};

export default Onboarding;