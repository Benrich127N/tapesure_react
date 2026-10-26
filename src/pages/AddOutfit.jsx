import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db, auth } from "../../firebase";
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  celebrateMilestone,
  CUSTOMER_MILESTONES,
  ORDER_MILESTONES,
} from "../utils/milestones";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Save,
  UserPlus,
} from "lucide-react";

const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
};

const measurementFields = [
  "shoulder",
  "chest",
  "neck",
  "sleeve",
  "sleeveCirc",
  "topLength",
  "waist",
  "hip",
  "lap",
  "crotch",
  "knee",
  "boot",
  "trouserLength",
];

const AddOutfit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedClientId = searchParams.get("clientId");
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("new");
  const [showDateShortcuts, setShowDateShortcuts] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    outfitType: "",
    status: "Received",
    dueDate: getDefaultDueDate(),
    amount: "",
    clientGender: "male",
    shoulder: "",
    chest: "",
    neck: "",
    sleeve: "",
    sleeveCirc: "",
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

  useEffect(() => {
    const fetchClients = async () => {
      if (!auth.currentUser) return;

      const snapshot = await getDocs(
        query(
          collection(db, "clients"),
          where("userId", "==", auth.currentUser.uid),
        ),
      );

      const loadedClients = snapshot.docs.map((clientDoc) => ({
          id: clientDoc.id,
          ...clientDoc.data(),
        }));

      setClients(loadedClients);

      const requestedClient = loadedClients.find(
        (client) => client.id === requestedClientId,
      );
      if (requestedClient) {
        setSelectedClientId(requestedClient.id);
        setFormData((current) => ({
          ...current,
          clientName: requestedClient.name || "",
          clientPhone: requestedClient.phone || "",
        }));
      }
    };

    fetchClients().catch((error) => {
      console.error("Unable to load customers:", error);
    });
  }, [requestedClientId]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const selectClient = (clientId) => {
    setSelectedClientId(clientId);

    if (clientId === "new") {
      setFormData((current) => ({
        ...current,
        clientName: "",
        clientPhone: "",
      }));
      return;
    }

    const client = clients.find((item) => item.id === clientId);
    if (client) {
      setFormData((current) => ({
        ...current,
        clientName: client.name || "",
        clientPhone: client.phone || "",
      }));
    }
  };

  const setQuickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    updateField("dueDate", date.toISOString().split("T")[0]);
    setShowDateShortcuts(false);
  };

  const saveClient = async () => {
    if (selectedClientId !== "new") {
      const existingClient = clients.find(
        (client) => client.id === selectedClientId,
      );

      if (existingClient?.phone !== formData.clientPhone.trim()) {
        await updateDoc(doc(db, "clients", selectedClientId), {
          phone: formData.clientPhone.trim(),
          updatedAt: serverTimestamp(),
        });
      }

      return selectedClientId;
    }

    const clientRef = await addDoc(collection(db, "clients"), {
      userId: auth.currentUser.uid,
      name: formData.clientName.trim(),
      phone: formData.clientPhone.trim(),
      email: "",
      createdAt: serverTimestamp(),
    });

    return clientRef.id;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.clientName.trim() || !formData.clientPhone.trim()) {
      alert("Customer name and phone number are required.");
      return;
    }

    if (!formData.outfitType.trim() || !formData.dueDate) {
      alert("Outfit type and delivery date are required.");
      return;
    }

    setSaving(true);

    try {
      const clientId = await saveClient();
      const hasMeasurements = measurementFields.some(
        (field) => formData[field] !== "",
      );

      const measurements = hasMeasurements
        ? {
            clientGender: formData.clientGender,
            top: {
              shoulder: Number(formData.shoulder) || 0,
              chest: Number(formData.chest) || 0,
              neck: Number(formData.neck) || 0,
              sleeve: Number(formData.sleeve) || 0,
              sleeveCircumference: Number(formData.sleeveCirc) || 0,
              length: Number(formData.topLength) || 0,
            },
            trouser: {
              waist: Number(formData.waist) || 0,
              hip: Number(formData.hip) || 0,
              lap: Number(formData.lap) || 0,
              crotch: Number(formData.crotch) || 0,
              knee: Number(formData.knee) || 0,
              boot: Number(formData.boot) || 0,
              length: Number(formData.trouserLength) || 0,
            },
            notes: formData.notes.trim(),
          }
        : null;

      const orderRef = await addDoc(collection(db, "outfits"), {
        userId: auth.currentUser.uid,
        clientId,
        clientName: formData.clientName.trim(),
        clientPhone: formData.clientPhone.trim(),
        outfitType: formData.outfitType.trim(),
        status: formData.status,
        dueDate: formData.dueDate,
        amount: Number(formData.amount) || 0,
        notes: formData.notes.trim(),
        measurements,
        createdAt: serverTimestamp(),
      });

      try {
        const [customerCountSnapshot, orderCountSnapshot] = await Promise.all([
        getCountFromServer(
          query(
            collection(db, "clients"),
            where("userId", "==", auth.currentUser.uid),
          ),
        ),
        getCountFromServer(
          query(
            collection(db, "outfits"),
            where("userId", "==", auth.currentUser.uid),
          ),
        ),
      ]);
        const customerCount = customerCountSnapshot.data().count;
        const orderCount = orderCountSnapshot.data().count;
        const createdNewCustomer = selectedClientId === "new";

        if (createdNewCustomer && customerCount === 1 && orderCount === 1) {
          celebrateMilestone({
            id: "first-customer-order",
            title: "Your first customer is in!",
            message: `${formData.clientName.trim()} is now saved, and your first order is officially underway.`,
            emoji: "✂️",
          });
        } else {
          if (createdNewCustomer && CUSTOMER_MILESTONES.includes(customerCount)) {
            celebrateMilestone({
              id: `customers-${customerCount}`,
              title: `${customerCount} customers!`,
              message: "Your customer book is growing. Every relationship is a stitch in your shop's story.",
              emoji: "🤝",
            });
          }

          if (ORDER_MILESTONES.includes(orderCount)) {
            celebrateMilestone({
              id: `orders-${orderCount}`,
              title: orderCount === 1 ? "Your first order is underway!" : `${orderCount} orders created!`,
              message: orderCount === 1
                ? "Your order book has officially started. Keep the momentum going."
                : "A strong record of the work moving through your shop. Keep the momentum going.",
              emoji: "🧵",
            });
          }
        }
      } catch (milestoneError) {
        console.warn("Order saved, but milestone counting failed:", milestoneError);
      }

      localStorage.setItem("tapesure-first-order-created", "true");
      window.dispatchEvent(new Event("tapesure:order-created"));
      navigate(`/outfits/${orderRef.id}`, { replace: true });
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save the order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const MeasurementInput = ({ field, label }) => (
    <input
      type="number"
      min="0"
      step="0.5"
      value={formData[field]}
      onChange={(event) => updateField(field, event.target.value)}
      placeholder={label}
      aria-label={`${label} measurement in inches`}
      className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 outline-none"
    />
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white transition text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="text-right">
          <h1 className="text-xl sm:text-2xl font-bold text-white">New Order</h1>
          <p className="text-xs text-gray-500">Customer first, details when you need them</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 space-y-5"
      >
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <h2 className="text-sm font-bold text-white">Customer</h2>
              <p className="text-xs text-gray-500">Choose a returning customer or add a new one.</p>
            </div>
          </div>

          {clients.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Customer</label>
              <select
                value={selectedClientId}
                onChange={(event) => selectClient(event.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="new">+ Add a new customer</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}{client.phone ? ` — ${client.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Customer name <span className="text-red-400">*</span></label>
              <input
                required
                type="text"
                value={formData.clientName}
                onChange={(event) => updateField("clientName", event.target.value)}
                readOnly={selectedClientId !== "new"}
                placeholder="e.g. Ada Okafor"
                autoFocus={clients.length === 0}
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none read-only:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phone number <span className="text-red-400">*</span></label>
              <input
                required
                type="tel"
                value={formData.clientPhone}
                onChange={(event) => updateField("clientPhone", event.target.value)}
                placeholder="e.g. 0801 234 5678"
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-5 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <h2 className="text-sm font-bold text-white">Order</h2>
              <p className="text-xs text-gray-500">Capture what you are making and when it is due.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Outfit type <span className="text-red-400">*</span></label>
              <input
                required
                type="text"
                value={formData.outfitType}
                onChange={(event) => updateField("outfitType", event.target.value)}
                placeholder="e.g. Kaftan, gown, suit"
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-medium text-gray-400 mb-1">Delivery date <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                <input
                  required
                  type="date"
                  value={formData.dueDate}
                  onChange={(event) => updateField("dueDate", event.target.value)}
                  className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  aria-label="Choose a quick delivery date"
                  onClick={() => setShowDateShortcuts((current) => !current)}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-3 rounded-lg"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
              {showDateShortcuts && (
                <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 z-10 flex flex-wrap gap-1 shadow-lg">
                  {[3, 7, 14, 30].map((days) => (
                    <button key={days} type="button" onClick={() => setQuickDate(days)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white">
                      {days === 7 ? "1 week" : days === 14 ? "2 weeks" : days === 30 ? "1 month" : "3 days"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => setShowMeasurements((current) => !current)}
            className="w-full flex items-center justify-between text-left py-2"
          >
            <span>
              <span className="block text-sm font-semibold text-white">Measurements</span>
              <span className="block text-xs text-gray-500">Optional — add them now or later</span>
            </span>
            {showMeasurements ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showMeasurements && (
            <div className="space-y-4 pt-3">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">Customer:</span>
                {[
                  ["male", "Male"],
                  ["female", "Female"],
                ].map(([value, label]) => (
                  <label key={value} className="flex items-center gap-1.5 text-xs text-gray-300">
                    <input type="radio" name="gender" value={value} checked={formData.clientGender === value} onChange={(event) => updateField("clientGender", event.target.value)} />
                    {label}
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-yellow-400 mb-2 uppercase tracking-wide">Top measurements (inches)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <MeasurementInput field="shoulder" label="Shoulder" />
                  <MeasurementInput field="chest" label="Chest" />
                  <MeasurementInput field="neck" label="Neck" />
                  <MeasurementInput field="sleeve" label="Sleeve" />
                  <MeasurementInput field="sleeveCirc" label="Sleeve circ." />
                  <MeasurementInput field="topLength" label="Top length" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">Trouser measurements (inches)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  <MeasurementInput field="waist" label="Waist" />
                  <MeasurementInput field="hip" label="Hip" />
                  <MeasurementInput field="lap" label="Lap" />
                  <MeasurementInput field="crotch" label="Crotch" />
                  <MeasurementInput field="knee" label="Knee" />
                  <MeasurementInput field="boot" label="Boot" />
                  <MeasurementInput field="trouserLength" label="Trouser length" />
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => setShowExtraDetails((current) => !current)}
            className="w-full flex items-center justify-between text-left py-2"
          >
            <span>
              <span className="block text-sm font-semibold text-white">Price, status and notes</span>
              <span className="block text-xs text-gray-500">Optional order details</span>
            </span>
            {showExtraDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showExtraDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Amount (₦)</label>
                <input type="number" min="0" value={formData.amount} onChange={(event) => updateField("amount", event.target.value)} placeholder="0" className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                <select value={formData.status} onChange={(event) => updateField("status", event.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Received">Received</option>
                  <option value="Cutting">Cutting</option>
                  <option value="Sewing">Sewing</option>
                  <option value="Fitting">Fitting</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Style, fabric or fitting notes..." rows="3" className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
              </div>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 transition ${saving ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-lg"}`}
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving order...</>
          ) : (
            <><Save className="w-5 h-5" /> Save Customer Order</>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <UserPlus className="w-4 h-4" /> New customers are saved automatically for future orders.
        </div>
      </form>
    </div>
  );
};

export default AddOutfit;
