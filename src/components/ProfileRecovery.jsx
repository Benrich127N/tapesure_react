import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import "../pages/Onboarding.css";

export default function ProfileRecovery({ user, onRetry }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const leave = async () => {
    if (pending.current) return;
    pending.current = true; setLeaving(true); setError("");
    try { await signOut(auth); navigate("/login", { replace:true }); }
    catch { setError("Could not sign out. Check your connection and try again."); }
    finally { pending.current = false; setLeaving(false); }
  };
  return <main className="onboarding-page" aria-labelledby="profile-recovery-title"><section className="onboarding-card w-full max-w-lg space-y-4 rounded-2xl border border-gray-700 bg-gray-900 p-5 sm:p-8"><p className="text-sm font-bold text-indigo-200">TapeSure</p><h1 id="profile-recovery-title" className="text-2xl font-bold text-white">Could not load your workspace</h1><p role="alert" className="text-sm leading-6 text-gray-200">Your account details are unavailable. Check your connection and retry. Your shop settings have not been changed.</p><p className="break-words text-sm text-gray-300">{user?.email || "Signed-in account"}</p>{error && <p role="alert" className="text-sm text-red-200">{error}</p>}<button disabled={leaving} onClick={onRetry} className="onboarding-button w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">Retry loading workspace</button><button disabled={leaving} onClick={leave} className="onboarding-button w-full text-sm text-indigo-200 underline disabled:opacity-60">{leaving ? "Signing out…" : "Sign out to use another account"}</button></section></main>;
}
