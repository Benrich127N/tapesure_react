import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { ArrowRight, Scissors, Store } from "lucide-react";
import { onboardingUpdate } from "../utils/onboarding";
import "./Onboarding.css";

export default function Onboarding({ profile, onComplete }) {
  const navigate = useNavigate();
  const [shopName, setShopName] = useState(profile?.shopName || "");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const pending = useRef(false);
  const inputRef = useRef(null);
  const user = auth.currentUser;

  const submit = async event => {
    event.preventDefault();
    if (pending.current) return;
    setError(""); setNameError("");
    if (!shopName.trim()) { setNameError("Enter a shop name to continue."); inputRef.current?.focus(); return; }
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== user?.uid) { setSessionExpired(true); setError("Your session has ended. Sign in again to finish setting up your shop."); return; }
    pending.current = true; setSaving(true);
    try {
      const saved = await runTransaction(db, async transaction => {
        const reference = doc(db, "users", currentUser.uid);
        const snapshot = await transaction.get(reference);
        const existing = snapshot.exists() ? snapshot.data() : null;
        const changes = onboardingUpdate(existing, currentUser, shopName, serverTimestamp());
        if (changes) transaction.set(reference, changes, { merge: true });
        return { ...existing, ...changes };
      });
      if (auth.currentUser?.uid !== currentUser.uid) return;
      navigate("/outfits/new", { replace: true });
      onComplete?.(saved);
    } catch (cause) {
      if (["unauthenticated", "auth/user-token-expired", "auth/requires-recent-login"].includes(cause.code)) {
        setSessionExpired(true); setError("Your session has ended. Sign in again to finish setting up your shop.");
      } else {
        setError("Could not save your shop. Your name is still here. Check your connection and choose Save and continue to try again.");
      }
    } finally { pending.current = false; setSaving(false); }
  };
  const leave = async () => {
    if (pending.current) return;
    pending.current = true; setSigningOut(true); setError("");
    try { await signOut(auth); navigate("/login", { replace: true }); }
    catch { setError("Could not sign out. Check your connection and try again."); }
    finally { pending.current = false; setSigningOut(false); }
  };
  const busy = saving || signingOut;
  return <main className="onboarding-page" aria-labelledby="onboarding-title">
    <section className="onboarding-card w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 p-5 sm:p-8">
      <header className="mb-6"><p className="mb-5 text-sm font-bold tracking-wide text-indigo-200">TapeSure</p><div aria-hidden="true" className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300"><Scissors size={26}/></div><h1 id="onboarding-title" className="text-2xl font-bold text-white sm:text-3xl">Name your shop</h1><p id="onboarding-description" className="mt-2 text-sm leading-6 text-gray-300">Your shop name will appear in your workspace and on new invoices. You can change it later in Settings.</p></header>
      <form onSubmit={submit} noValidate aria-busy={saving} aria-describedby="onboarding-description" className="space-y-4">
        <div><label htmlFor="onboarding-shop-name" className="mb-2 block text-sm font-medium text-white">Shop name <span className="font-normal text-gray-300">(required)</span></label><div className="relative"><Store aria-hidden="true" size={20} className="pointer-events-none absolute left-3 top-3 text-gray-300"/><input ref={inputRef} id="onboarding-shop-name" name="shopName" autoComplete="organization" required disabled={busy || sessionExpired} value={shopName} onChange={event => { setShopName(event.target.value); setNameError(""); setError(""); }} placeholder="e.g. Ben Couture" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "onboarding-name-error" : "onboarding-next-step"} className="min-h-11 w-full rounded-lg border border-gray-500 bg-gray-800 py-2.5 pl-10 pr-3 text-base text-white placeholder-gray-400 disabled:opacity-60"/></div>{nameError && <p id="onboarding-name-error" role="alert" className="mt-2 text-sm text-red-200">{nameError}</p>}</div>
        {error && <p role="alert" className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">{error}</p>}
        <p id="onboarding-next-step" className="text-sm text-gray-300">Next, you can add your first order.</p>
        <button type="submit" disabled={busy || sessionExpired} className="onboarding-button w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-300">{saving ? "Saving your shop…" : "Save and continue"}{!saving && <ArrowRight aria-hidden="true" size={18}/>}</button>
        <p role="status" className="sr-only">{saving ? "Saving your shop. Please wait." : ""}</p>
      </form>
      <footer className="mt-6 border-t border-gray-700 pt-4"><p className="text-xs text-gray-300">Signed in as</p><p className="mt-1 break-words text-sm font-medium text-white">{user?.email || user?.displayName || "Session unavailable"}</p><button type="button" disabled={busy} onClick={leave} className="onboarding-button mt-2 text-sm text-indigo-200 underline hover:bg-gray-800 disabled:opacity-60">{signingOut ? "Signing out…" : sessionExpired ? "Sign in again" : "Sign out to use another account"}</button></footer>
    </section>
  </main>;
}
