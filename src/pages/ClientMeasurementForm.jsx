import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Ruler, Scissors, ShieldCheck } from "lucide-react";
import {
  getShopProfile,
  saveMeasurementSubmission,
} from "../utils/shopProfile";

const initialForm = {
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
};

const topFields = [
  ["shoulder", "Shoulder"],
  ["chest", "Chest / Bust"],
  ["neck", "Neck"],
  ["sleeve", "Sleeve length"],
  ["sleeveCircumference", "Sleeve round"],
  ["topLength", "Top length"],
];

const trouserFields = [
  ["waist", "Waist"],
  ["hip", "Hip"],
  ["lap", "Thigh / Lap"],
  ["crotch", "Crotch"],
  ["knee", "Knee"],
  ["boot", "Ankle / Boot"],
  ["trouserLength", "Trouser length"],
];

const MeasurementInput = ({ name, label, value, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
    <div className="relative">
      <input
        type="number"
        min="0"
        step="0.1"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        placeholder="0.0"
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
      <span className="absolute right-3 top-3.5 text-xs text-slate-500">in</span>
    </div>
  </label>
);

const ClientMeasurementForm = () => {
  const { shopSlug } = useParams();
  const shop = useMemo(() => getShopProfile(), []);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const validLink = shopSlug === shop.shareSlug;

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "", measurements: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.clientName.trim()) nextErrors.clientName = "Please enter your full name.";
    if (!form.clientPhone.trim()) nextErrors.clientPhone = "Please enter your phone number.";
    if (form.clientEmail && !/^\S+@\S+\.\S+$/.test(form.clientEmail)) {
      nextErrors.clientEmail = "Please enter a valid email address.";
    }
    const measurementNames = [...topFields, ...trouserFields].map(([name]) => name);
    if (!measurementNames.some((name) => form[name] !== "")) {
      nextErrors.measurements = "Enter at least one measurement before submitting.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const toNumber = (value) => (value === "" ? null : Number(value));
    saveMeasurementSubmission({
      id: `MSR-${Date.now()}`,
      shopSlug,
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim(),
      clientEmail: form.clientEmail.trim(),
      clientGender: form.clientGender,
      top: Object.fromEntries(topFields.map(([name]) => [name, toNumber(form[name])])),
      trouser: Object.fromEntries(
        trouserFields.map(([name]) => [name, toNumber(form[name])]),
      ),
      notes: form.notes.trim(),
      submittedAt: new Date().toISOString(),
      status: "New",
    });
    setForm(initialForm);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!validLink) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-400" />
          <h1 className="mb-2 text-2xl font-bold">This form is unavailable</h1>
          <p className="text-slate-400">Ask the shop for their latest measurement link.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Scissors className="h-7 w-7" />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">Measurement form</p>
          <h1 className="text-3xl font-bold sm:text-5xl">{shop.shopName}</h1>
          <p className="mt-4 max-w-2xl text-indigo-100">Share your details and measurements securely. All measurements should be entered in inches.</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8 sm:py-12">
        {submitted && (
          <div className="mb-8 flex gap-3 rounded-2xl border border-emerald-700/60 bg-emerald-950/50 p-5" role="status">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400" />
            <div>
              <h2 className="font-semibold text-emerald-200">Measurements sent successfully</h2>
              <p className="mt-1 text-sm text-emerald-300/80">{shop.shopName} has received your submission.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <h2 className="mb-6 text-xl font-semibold">Your information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-300">Full name *</span>
                <input name="clientName" value={form.clientName} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Your full name" />
                {errors.clientName && <span className="mt-2 block text-sm text-rose-400">{errors.clientName}</span>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Phone number *</span>
                <input type="tel" name="clientPhone" value={form.clientPhone} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500" placeholder="+234 800 000 0000" />
                {errors.clientPhone && <span className="mt-2 block text-sm text-rose-400">{errors.clientPhone}</span>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Email <span className="text-slate-500">(optional)</span></span>
                <input type="email" name="clientEmail" value={form.clientEmail} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500" placeholder="you@example.com" />
                {errors.clientEmail && <span className="mt-2 block text-sm text-rose-400">{errors.clientEmail}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-300">Gender / fit</span>
                <select name="clientGender" value={form.clientGender} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3"><Ruler className="h-5 w-5 text-amber-400" /><h2 className="text-xl font-semibold">Top measurements</h2></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topFields.map(([name, label]) => <MeasurementInput key={name} name={name} label={label} value={form[name]} onChange={handleChange} />)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3"><Ruler className="h-5 w-5 text-emerald-400" /><h2 className="text-xl font-semibold">Trouser measurements</h2></div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trouserFields.map(([name, label]) => <MeasurementInput key={name} name={name} label={label} value={form[name]} onChange={handleChange} />)}
            </div>
            {errors.measurements && <p className="mt-5 rounded-lg bg-rose-950/50 p-3 text-sm text-rose-300">{errors.measurements}</p>}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
            <label className="block">
              <span className="mb-2 block text-lg font-semibold">Notes or special requests</span>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Tell the shop anything else they should know..." />
            </label>
          </section>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="mb-4 flex items-start gap-3 text-sm text-slate-400 sm:mb-0"><ShieldCheck className="h-5 w-5 shrink-0 text-indigo-400" /><p>Your details are sent only to {shop.shopName} for your clothing order.</p></div>
            <button type="submit" className="w-full shrink-0 rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:w-auto">Submit measurements</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ClientMeasurementForm;
