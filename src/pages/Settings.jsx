import { useEffect, useRef, useState } from "react";
import { auth, db } from "../../firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Bell, Mail, Moon, Save, Store } from "lucide-react";
import { normalizeSettings, saveSettings, settingsChanged } from "../utils/settings";
import "./Settings.css";

const empty = { shopName: "", fullName: "", phone: "" };
export default function Settings() {
  const user = auth.currentUser;
  const uid = user?.uid;
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [needsNameSync, setNeedsNameSync] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const savingRef = useRef(false);
  const loadId = useRef(0);
  const shopInput = useRef(null);

  useEffect(() => {
    const request = ++loadId.current;
    let active = true;
    setLoading(true);
    setLoadError("");
    setSaveError("");
    setNotice("");
    setForm(empty);
    setSaved(empty);
    setNeedsNameSync(false);
    const load = async () => {
      try {
        if (!uid) throw new Error("Sign in to manage your settings.");
        const snapshot = await getDoc(doc(db, "users", uid));
        if (!snapshot.exists()) throw new Error("Your shop settings are unavailable. Try loading them again.");
        if (!active) return;
        const data = snapshot.data();
        const values = { shopName: data.shopName || "", fullName: data.fullName ?? auth.currentUser?.displayName ?? "", phone: data.phone || "" };
        setForm(values);
        setSaved(values);
        setNeedsNameSync(values.fullName !== (auth.currentUser?.displayName || ""));
      } catch (error) {
        if (active && request === loadId.current) setLoadError(error.code ? "Could not load your settings. Check your connection and try again." : error.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [uid, attempt]);

  const dirty = settingsChanged(form, saved);
  const unavailable = loading || Boolean(loadError) || saving;
  const change = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
    setSaveError("");
    setNotice("");
  };
  const submit = async event => {
    event.preventDefault();
    if (savingRef.current || unavailable || (!dirty && !needsNameSync)) return;
    if (!normalizeSettings(form).shopName) {
      setSaveError("Enter a shop name before saving.");
      shopInput.current?.focus();
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) { setSaveError("Your session has changed. Reload the page and sign in again."); return; }
    const request = loadId.current;
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    setNotice("");
    try {
      const result = await saveSettings({
        values: form,
        saved,
        needsNameSync,
        saveShop: values => setDoc(doc(db, "users", uid), values, { merge: true }),
        syncName: fullName => updateProfile(currentUser, { displayName: fullName }),
      });
      if (request !== loadId.current) return;
      setSaved(result.values);
      setForm(result.values);
      setNeedsNameSync(result.needsNameSync);
      if (!result.needsNameSync) setNotice(dirty ? "Shop and account settings saved." : "Account name synced.");
    } catch {
      if (request === loadId.current) setSaveError("Could not save your shop details. Your edits are still here. Check your connection and try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return <section className="settings-page space-y-5" aria-labelledby="settings-title">
    <header><h1 id="settings-title" className="text-2xl font-bold text-white sm:text-3xl">Settings</h1><p className="mt-1 text-sm text-gray-300">Manage your shop details and account information.</p></header>
    <div className="settings-layout">
      <section className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="shop-settings-title">
        <h2 id="shop-settings-title" className="flex items-center gap-2 text-lg font-semibold text-white"><Store aria-hidden="true" size={20} className="shrink-0 text-indigo-300" />Shop and account</h2>
        <p className="mt-2 text-sm text-gray-300">Your shop name appears in your workspace and on new invoices.</p>
        {loading && <p role="status" className="mt-4 rounded-lg bg-gray-800 p-3 text-sm text-gray-200">Loading your settings…</p>}
        {loadError && <div role="alert" className="mt-4 space-y-3 rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-200"><p>{loadError}</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="settings-button bg-indigo-600 text-white hover:bg-indigo-500">Retry loading settings</button></div>}
        <form onSubmit={submit} aria-busy={loading || saving} className="mt-5 space-y-5">
          <fieldset disabled={unavailable} className="min-w-0 space-y-4">
            <legend className="sr-only">Editable shop details</legend>
            <div><label htmlFor="settings-shop" className="settings-label">Shop name <span className="font-normal text-gray-300">(required)</span></label><input ref={shopInput} id="settings-shop" name="shopName" autoComplete="organization" required value={form.shopName} onChange={change} aria-invalid={saveError && !form.shopName.trim() ? true : undefined} aria-describedby={saveError ? "settings-save-error" : undefined} className="settings-input" /></div>
            <div><label htmlFor="settings-phone" className="settings-label">Business phone <span className="font-normal text-gray-300">(optional)</span></label><input id="settings-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={change} placeholder="e.g. 0801 234 5678" className="settings-input" /></div>
            <div><label htmlFor="settings-name" className="settings-label">Your name <span className="font-normal text-gray-300">(optional)</span></label><input id="settings-name" name="fullName" autoComplete="name" value={form.fullName} onChange={change} className="settings-input" /></div>
          </fieldset>
          <div><label htmlFor="settings-email" className="settings-label">Email address</label><input id="settings-email" name="email" type="email" value={user?.email || ""} readOnly aria-describedby="settings-email-help" className="settings-input text-gray-200" /><p id="settings-email-help" className="mt-2 text-xs text-gray-300">This is your sign-in email. It can be selected and copied, but cannot be changed here.</p></div>
          <div aria-live="polite" aria-atomic="true">
            {saveError && <p id="settings-save-error" role="alert" className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">{saveError}</p>}
            {notice && <p className="rounded-lg border border-green-800 bg-green-900/20 p-3 text-sm text-green-200">{notice}</p>}
            {!loading && !loadError && needsNameSync && <p className="rounded-lg border border-amber-800 bg-amber-900/20 p-3 text-sm text-amber-200">Your shop details are saved. Your account name still needs to sync. {dirty ? "Save your changes to try syncing again." : "Choose Retry name sync to finish."}</p>}
          </div>
          <div className="settings-save-row flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-gray-300" role="status">{loading ? "" : loadError ? "Changes unavailable until settings load." : saving ? "Saving your settings…" : dirty ? "You have unsaved changes." : needsNameSync ? "Account name sync pending." : "No unsaved changes."}</p><button type="submit" disabled={unavailable || (!dirty && !needsNameSync)} className="settings-button bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-400"><Save aria-hidden="true" size={18} />{saving ? "Saving…" : needsNameSync && !dirty ? "Retry name sync" : "Save changes"}</button></div>
        </form>
      </section>
      <aside className="min-w-0 self-start rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="settings-preferences-title">
        <h2 id="settings-preferences-title" className="text-lg font-semibold text-white">Preferences</h2><p className="mt-2 text-sm text-gray-300">Available appearance and notification options.</p>
        <dl className="mt-5 divide-y divide-gray-700">
          <div className="pb-4"><dt className="flex flex-wrap items-center gap-2 font-medium text-white"><Moon aria-hidden="true" size={18} className="shrink-0 text-indigo-300" />Dark appearance<span className="settings-availability border-green-800 bg-green-900/20 text-green-200">Active</span></dt><dd className="mt-2 text-sm text-gray-300">TapeSure currently uses a dark appearance. Light appearance is not available yet.</dd></div>
          <div className="py-4"><dt className="flex flex-wrap items-center gap-2 font-medium text-white"><Mail aria-hidden="true" size={18} className="shrink-0 text-indigo-300" />Email notifications<span className="settings-availability border-gray-600 text-gray-300">Not available</span></dt><dd className="mt-2 text-sm text-gray-300">Email notifications are not available yet.</dd></div>
          <div className="pt-4"><dt className="flex flex-wrap items-center gap-2 font-medium text-white"><Bell aria-hidden="true" size={18} className="shrink-0 text-indigo-300" />SMS notifications<span className="settings-availability border-gray-600 text-gray-300">Not available</span></dt><dd className="mt-2 text-sm text-gray-300">SMS notifications are not available yet.</dd></div>
        </dl>
      </aside>
    </div>
  </section>;
}
