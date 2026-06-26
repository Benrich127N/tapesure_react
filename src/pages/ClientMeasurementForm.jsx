import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  AlertCircle,
  CheckCircle,
  Loader,
  ChevronDown,
  User,
  Ruler,
} from "lucide-react";

const ClientMeasurementForm = () => {
  const { tailorId } = useParams();
  const [tailor, setTailor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [expandedSection, setExpandedSection] = useState("client");

  const [formData, setFormData] = useState({
    // Client Info
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientGender: "male",

    // Top Measurements
    shoulder: "",
    chest: "",
    neck: "",
    sleeve: "",
    sleeveCircumference: "",
    topLength: "",

    // Trouser Measurements
    waist: "",
    hip: "",
    lap: "",
    crotch: "",
    knee: "",
    boot: "",
    trouserLength: "",

    // Notes
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch tailor info
  useEffect(() => {
    const fetchTailorInfo = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", tailorId));
        if (userDoc.exists()) {
          setTailor(userDoc.data());
        } else {
          setError("Tailor not found");
        }
      } catch (err) {
        console.error("Error fetching tailor:", err);
        setError("Failed to load tailor information");
      } finally {
        setLoading(false);
      }
    };

    fetchTailorInfo();
  }, [tailorId]);

  const validateForm = () => {
    const newErrors = {};

    // Client info validation
    if (!formData.clientName.trim()) {
      newErrors.clientName = "Full name is required";
    }
    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = "Phone number is required";
    }
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = "Email is invalid";
    }

    // At least some measurements required
    const measurementFields = [
      "shoulder",
      "chest",
      "neck",
      "sleeve",
      "waist",
      "hip",
      "lap",
      "crotch",
    ];
    const hasMeasurements = measurementFields.some(
      (field) => formData[field]?.trim()
    );

    if (!hasMeasurements) {
      newErrors.measurements =
        "Please enter at least a few measurements";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Create measurement object
      const measurement = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        clientGender: formData.clientGender,
        top: {
          shoulder: parseFloat(formData.shoulder) || 0,
          chest: parseFloat(formData.chest) || 0,
          neck: parseFloat(formData.neck) || 0,
          sleeve: parseFloat(formData.sleeve) || 0,
          sleeveCircumference: parseFloat(formData.sleeveCircumference) || 0,
          length: parseFloat(formData.topLength) || 0,
        },
        trouser: {
          waist: parseFloat(formData.waist) || 0,
          hip: parseFloat(formData.hip) || 0,
          lap: parseFloat(formData.lap) || 0,
          crotch: parseFloat(formData.crotch) || 0,
          knee: parseFloat(formData.knee) || 0,
          boot: parseFloat(formData.boot) || 0,
          length: parseFloat(formData.trouserLength) || 0,
        },
        notes: formData.notes,
        submittedAt: serverTimestamp(),
      };

      // Update tailor's measurements collection
      await updateDoc(doc(db, "users", tailorId), {
        clientMeasurements: arrayUnion(measurement),
      });

      setSuccess(true);
      setFormData({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        clientGender: "male",
        shoulder: "",
        chest: "",
        neck: "",
        sleeve: "",
        sleeveCircumference: "",
        topLength: "",
        waist: "",
        hip: "",
        lap: "",
        crotch: "",
        knee: "",
        boot: "",
        trouserLength: "",
        notes: "",
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Error submitting measurements:", err);
      setError("Failed to submit measurements. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
            <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
          <p className="text-gray-400">Loading tailor information...</p>
        </div>
      </div>
    );
  }

  if (error && !tailor) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">{error}</p>
          
            href="/"
            className="text-indigo-500 hover:text-indigo-400 text-sm font-medium"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Tailor Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 h-48 sm:h-64">
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative h-full flex items-end p-6 sm:p-8">
          <div className="flex items-end gap-4">
            {/* Shop Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {tailor?.shopName?.charAt(0)?.toUpperCase() || "T"}
                </span>
              </div>
            </div>

            {/* Shop Info */}
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {tailor?.shopName || "Tailor Shop"}
              </h1>
              <p className="text-white/80 text-sm">
                Submit your measurements for accurate tailoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-300 font-medium">
                Measurements submitted successfully!
              </p>
              <p className="text-green-400 text-sm">
                {tailor?.shopName} will use your measurements for accurate tailoring.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Client Information Section */}
            <div className="border-b border-gray-800">
              <button
                type="button"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "client" ? "" : "client"
                  )
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-white">
                    Your Information
                  </h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSection === "client" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedSection === "client" && (
                <div className="px-6 py-6 space-y-4 bg-gray-800/30">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`w-full bg-gray-800 border ${
                        errors.clientName ? "border-red-500" : "border-gray-700"
                      } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    {errors.clientName && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.clientName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      placeholder="+234 901 234 5678"
                      className={`w-full bg-gray-800 border ${
                        errors.clientPhone ? "border-red-500" : "border-gray-700"
                      } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    {errors.clientPhone && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.clientPhone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`w-full bg-gray-800 border ${
                        errors.clientEmail ? "border-red-500" : "border-gray-700"
                      } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    {errors.clientEmail && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.clientEmail}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="clientGender"
                            value={option.value}
                            checked={formData.clientGender === option.value}
                            onChange={handleInputChange}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-300 text-sm">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Top Measurements Section */}
            <div className="border-b border-gray-800">
              <button
                type="button"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "top" ? "" : "top"
                  )
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-white">
                    Top Measurements (in inches)
                  </h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSection === "top" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedSection === "top" && (
                <div className="px-6 py-6 space-y-4 bg-gray-800/30">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "shoulder", label: "Shoulder" },
                      { name: "chest", label: "Chest" },
                      { name: "neck", label: "Neck" },
                      { name: "sleeve", label: "Sleeve" },
                      {
                        name: "sleeveCircumference",
                        label: "Sleeve Circumference",
                      },
                      { name: "topLength", label: "Length" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          placeholder="0"
                          step="0.5"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trouser Measurements Section */}
            <div className="border-b border-gray-800">
              <button
                type="button"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "trouser" ? "" : "trouser"
                  )
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-semibold text-white">
                    Trouser Measurements (in inches)
                  </h2>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSection === "trouser" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedSection === "trouser" && (
                <div className="px-6 py-6 space-y-4 bg-gray-800/30">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "waist", label: "Waist" },
                      { name: "hip", label: "Hip" },
                      { name: "lap", label: "Lap" },
                      { name: "crotch", label: "Crotch" },
                      { name: "knee", label: "Knee" },
                      { name: "boot", label: "Boot" },
                      { name: "trouserLength", label: "Length", full: true },
                    ].map((field) => (
                      <div key={field.name} className={field.full ? "col-span-2" : ""}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          placeholder="0"
                          step="0.5"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Notes Section */}
            <div className="border-b border-gray-800">
              <button
                type="button"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "notes" ? "" : "notes"
                  )
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition"
              >
                <h2 className="text-lg font-semibold text-white">
                  Additional Notes
                </h2>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSection === "notes" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedSection === "notes" && (
                <div className="px-6 py-6 bg-gray-800/30">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special requests or additional details..."
                    rows="4"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                  ></textarea>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="px-6 py-6 bg-gray-800/30 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Measurements"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">
            <span className="font-semibold text-gray-300">💡 Tip:</span> Provide
            as many measurements as possible for the most accurate tailoring. You
            can skip any fields you're unsure about.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientMeasurementForm;