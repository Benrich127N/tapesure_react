// src/pages/AddOutfit.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { 
  ArrowLeft, 
  Save, 
  Scissors, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  Tag,
  Ruler,
  ChevronRight,
  ChevronLeft,
  Check,
  Users
} from "lucide-react";

// Helper function to auto-create client if they don't exist
const ensureClientExists = async (clientName) => {
  if (!clientName.trim() || !auth.currentUser) return;

  const clientsRef = collection(db, "clients");
  const q = query(
    clientsRef,
    where("userId", "==", auth.currentUser.uid),
    where("name", "==", clientName.trim())
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    await addDoc(clientsRef, {
      userId: auth.currentUser.uid,
      name: clientName.trim(),
      phone: "", 
      email: "",
      measurements: {
        chest: 0,
        waist: 0,
        hip: 0
      },
      createdAt: serverTimestamp()
    });
  }
};

const AddOutfit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    clientName: "",
    outfitType: "",
    dueDate: "",
    amount: "",
    status: "Pending",
    notes: "",
    // Client gender for measurements
    clientGender: "male",
    // Measurements with proper sections
    measurements: {
      // Top measurements
      top: {
        shoulder: "",
        chest: "",
        neck: "",
        sleeve: "",
        sleeveCircumference: "",
        length: ""
      },
      // Trouser measurements
      trouser: {
        waist: "",
        hip: "",
        lap: "",
        crotch: "",
        knee: "",
        boot: "",
        length: ""
      },
      // General notes
      notes: ""
    }
  });

  const steps = [
    { number: 1, title: "Outfit Details", icon: Scissors },
    { number: 2, title: "Measurements (Optional)", icon: Ruler }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.clientName || !formData.outfitType || !formData.dueDate || !formData.amount) {
        alert("Please fill in all required fields");
        return;
      }
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSkipMeasurements = async () => {
    await handleSubmit(null, true);
  };

  const handleSubmit = async (e, skipMeasurements = false) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await ensureClientExists(formData.clientName);

      // Prepare measurements - only include if not skipping
      const measurementsData = skipMeasurements ? null : {
        clientGender: formData.clientGender,
        top: {
          shoulder: Number(formData.measurements.top.shoulder) || 0,
          chest: Number(formData.measurements.top.chest) || 0,
          neck: Number(formData.measurements.top.neck) || 0,
          sleeve: Number(formData.measurements.top.sleeve) || 0,
          sleeveCircumference: Number(formData.measurements.top.sleeveCircumference) || 0,
          length: Number(formData.measurements.top.length) || 0
        },
        trouser: {
          waist: Number(formData.measurements.trouser.waist) || 0,
          hip: Number(formData.measurements.trouser.hip) || 0,
          lap: Number(formData.measurements.trouser.lap) || 0,
          crotch: Number(formData.measurements.trouser.crotch) || 0,
          knee: Number(formData.measurements.trouser.knee) || 0,
          boot: Number(formData.measurements.trouser.boot) || 0,
          length: Number(formData.measurements.trouser.length) || 0
        },
        notes: formData.measurements.notes || ""
      };

      await addDoc(collection(db, "outfits"), {
        userId: auth.currentUser.uid,
        clientName: formData.clientName,
        outfitType: formData.outfitType,
        status: formData.status, 
        dueDate: formData.dueDate,
        amount: Number(formData.amount),
        notes: formData.notes,
        measurements: measurementsData,
        createdAt: serverTimestamp()
      });

      navigate("/outfits");
    } catch (error) {
      console.error("Error adding outfit:", error);
      alert("Failed to save outfit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/outfits")}
          className="flex items-center text-gray-400 hover:text-white transition text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Outfits
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">New Outfit Order</h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition ${
                  currentStep >= step.number 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {currentStep > step.number ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.number}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-medium ${
                    currentStep >= step.number ? 'text-indigo-400' : 'text-gray-500'
                  }`}>
                    Step {step.number}
                  </p>
                  <p className={`text-sm font-semibold ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                  currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        
        {/* STEP 1: Outfit Details */}
        {currentStep === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Outfit Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Client Name */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <User size={14} className="sm:w-4 sm:h-4" /> Client Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.clientName}
                  placeholder="e.g. Adebayo James"
                  className="w-full bg-black border border-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                />
              </div>

              {/* Outfit Type */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Scissors size={14} className="sm:w-4 sm:h-4" /> Outfit Type <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formData.outfitType}
                  placeholder="e.g. Agbada, Suit, Dress"
                  className="w-full bg-black border border-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  onChange={(e) => setFormData({...formData, outfitType: e.target.value})}
                />
              </div>

              {/* Status Picker */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Tag size={14} className="sm:w-4 sm:h-4" /> Order Status
                </label>
                <select
                  value={formData.status}
                  className="w-full bg-black border border-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Cutting">Cutting</option>
                  <option value="Sewing">Sewing</option>
                  <option value="Fitting">Fitting</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Calendar size={14} className="sm:w-4 sm:h-4" /> Due Date <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={formData.dueDate}
                  className="w-full bg-black border border-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <DollarSign size={14} className="sm:w-4 sm:h-4" /> Amount (₦) <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="number"
                  value={formData.amount}
                  placeholder="e.g. 50000"
                  className="w-full bg-black border border-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <FileText size={14} className="sm:w-4 sm:h-4" /> Notes
              </label>
              <textarea
                rows="3"
                value={formData.notes}
                placeholder="Fabric details, style variations, special requests..."
                className="w-full bg-black border border-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center gap-2 transition active:scale-95 text-sm sm:text-base"
              >
                Next: Measurements
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Measurements (Optional) */}
        {currentStep === 2 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white">Measurements (Optional)</h2>
                <p className="text-xs sm:text-sm text-gray-500">Standard tailoring measurements</p>
              </div>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-xs sm:text-sm text-indigo-300">
                💡 <strong>Tip:</strong> All measurements are in inches. You can skip this and add measurements later.
              </p>
            </div>

            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users size={14} className="sm:w-4 sm:h-4" /> Client Gender
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.clientGender === "male"}
                    onChange={(e) => setFormData({...formData, clientGender: e.target.value})}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">Male</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.clientGender === "female"}
                    onChange={(e) => setFormData({...formData, clientGender: e.target.value})}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-300">Female</span>
                </label>
              </div>
            </div>

            {/* TOP MEASUREMENTS */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                Top Measurements
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Shoulder */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Shoulder (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.top.shoulder}
                    placeholder="e.g. 18"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        top: {...formData.measurements.top, shoulder: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Chest */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Chest (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.top.chest}
                    placeholder="e.g. 42"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        top: {...formData.measurements.top, chest: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Neck */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Neck (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.top.neck}
                    placeholder="e.g. 16"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        top: {...formData.measurements.top, neck: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Sleeve */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Sleeve (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.top.sleeve}
                    placeholder="e.g. 24"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        top: {...formData.measurements.top, sleeve: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Sleeve Circumference */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Sleeve Circ. (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.top.sleeveCircumference}
                    placeholder="e.g. 14"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        top: {...formData.measurements.top, sleeveCircumference: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Top Length */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Length (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.top.length}
                    placeholder="e.g. 30"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        top: {...formData.measurements.top, length: e.target.value}
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* TROUSER MEASUREMENTS */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                Trouser Measurements
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Waist */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Waist (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.trouser.waist}
                    placeholder="e.g. 34"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        trouser: {...formData.measurements.trouser, waist: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Hip */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Hip (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.trouser.hip}
                    placeholder="e.g. 40"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        trouser: {...formData.measurements.trouser, hip: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Lap (Thigh) */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Lap/Thigh (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.trouser.lap}
                    placeholder="e.g. 24"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        trouser: {...formData.measurements.trouser, lap: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Crotch */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Crotch (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.trouser.crotch}
                    placeholder="e.g. 28"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        trouser: {...formData.measurements.trouser, crotch: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Knee */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Knee (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.trouser.knee}
                    placeholder="e.g. 18"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        trouser: {...formData.measurements.trouser, knee: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Boot (Ankle) */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Boot/Ankle (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.trouser.boot}
                    placeholder="e.g. 16"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        trouser: {...formData.measurements.trouser, boot: e.target.value}
                      }
                    })}
                  />
                </div>

                {/* Trouser Length */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-400">
                    Length (in)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.measurements.trouser.length}
                    placeholder="e.g. 42"
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    onChange={(e) => setFormData({
                      ...formData, 
                      measurements: {
                        ...formData.measurements,
                        trouser: {...formData.measurements.trouser, length: e.target.value}
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Measurement Notes */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400">
                Measurement Notes
              </label>
              <textarea
                rows="2"
                value={formData.measurements.notes}
                placeholder="e.g. Client prefers loose fit, add extra room in shoulders..."
                className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                onChange={(e) => setFormData({
                  ...formData, 
                  measurements: {...formData.measurements, notes: e.target.value}
                })}
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition active:scale-95 text-sm sm:text-base"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Back
              </button>
              <button
                type="button"
                onClick={handleSkipMeasurements}
                disabled={loading}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition active:scale-95 text-sm sm:text-base"
              >
                Skip Measurements
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${
                  loading 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
                }`}
              >
                {loading ? "Saving..." : <><Save size={18} className="sm:w-5 sm:h-5" /> Save Outfit</>}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddOutfit;