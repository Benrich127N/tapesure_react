import { useEffect, useRef, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { CheckCircle, Eye, EyeOff, Loader, Lock, Mail } from "lucide-react";
import PasswordResetDialog from "../components/PasswordResetDialog";
import GoogleMark from "../components/GoogleMark";
import { authErrorMessage, googleCancelled, validateAuth } from "../utils/auth";
import "./Login.css";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [operation, setOperation] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [canSignIn, setCanSignIn] = useState(false);
  const pending = useRef(false);
  const active = useRef(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const errorRef = useRef(null);
  const googleRef = useRef(null);
  const busy = Boolean(operation);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const switchMode = next => {
    if (pending.current || next === mode) return;
    setMode(next); setPassword(""); setVisible(false); setErrors({}); setNotice(""); setCanSignIn(false);
  };
  const start = async kind => {
    if (pending.current || resetOpen) return;
    setErrors({}); setNotice(""); setCanSignIn(false);
    if (kind !== "google") {
      const invalid = validateAuth(kind, email, password);
      if (Object.keys(invalid).length) {
        setErrors(invalid);
        requestAnimationFrame(() => (invalid.email ? emailRef : passwordRef).current?.focus());
        return;
      }
    }
    pending.current = true; setOperation(kind);
    try {
      if (kind === "google") await signInWithPopup(auth, googleProvider);
      else if (kind === "signup") await createUserWithEmailAndPassword(auth, email.trim(), password);
      else await signInWithEmailAndPassword(auth, email.trim(), password);
      // App owns profile loading and routing. Authentication never rewrites a
      // saved profile or describes a profile failure as a failed sign-in.
      if (active.current) setOperation("opening");
    } catch (cause) {
      pending.current = false;
      if (!active.current) return;
      setOperation("");
      if (kind === "google" && googleCancelled(cause)) {
        setNotice("Google sign-in was cancelled. Try again or sign in with email.");
        requestAnimationFrame(() => googleRef.current?.focus());
      } else {
        setErrors({ general: authErrorMessage(cause, kind) });
        setCanSignIn(cause.code === "auth/email-already-in-use");
        requestAnimationFrame(() => errorRef.current?.focus());
      }
    }
  };
  const progress = operation === "google" ? "Opening Google…" : operation === "signup" ? "Creating your account…" : operation === "opening" ? "Opening your workspace…" : "Signing in…";
  const changeEmail = event => { setEmail(event.target.value); setErrors(current => ({ ...current, email:undefined, general:undefined })); setNotice(""); setCanSignIn(false); };
  const changePassword = event => { setPassword(event.target.value); setErrors(current => ({ ...current, password:undefined, general:undefined })); setNotice(""); };
  return <main className="auth-page auth-screen" aria-labelledby="auth-heading"><div className="auth-layout w-full">
    <aside className="auth-intro" aria-label="About TapeSure"><div className="flex items-center gap-3 text-xl font-bold text-white"><img src="/icon-128x128.png" alt="" className="h-10 w-10"/>TapeSure</div><div><p className="mb-4 text-sm font-semibold text-indigo-200">YOUR TAILORING WORKSPACE</p><h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">More time for your craft.<br/>Less time on admin.</h2><p className="mt-5 max-w-md text-lg leading-relaxed text-gray-300">Keep your customers, measurements, orders, and invoices together in one organized workspace.</p><ul className="mt-8 space-y-4 text-gray-200">{["Customer details, always at hand","Orders and delivery dates, organized","Clear invoices and payment tracking"].map(text=><li key={text} className="flex items-center gap-3"><CheckCircle aria-hidden="true" size={20} className="shrink-0 text-indigo-300"/>{text}</li>)}</ul></div><p className="text-sm text-gray-300">Built for the way you work.</p></aside>
    <section className="auth-form-panel w-full min-w-0">
      <header className="mb-5"><div className="auth-mobile-brand mb-5 flex items-center gap-2 text-lg font-bold text-white"><img src="/icon-128x128.png" alt="" className="h-9 w-9"/>TapeSure</div><h1 id="auth-heading" className="text-2xl font-bold text-white sm:text-3xl">{mode === "login" ? "Sign in" : "Create your account"}</h1><p className="mt-2 text-sm text-gray-300">{mode === "login" ? "Welcome back to your tailoring workspace." : "Start with your shop name, then add your first order."}</p></header>
      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-4 sm:p-6">
        <div role="group" aria-label="Account access" className="mb-5 flex gap-1 rounded-xl bg-gray-800 p-1">{[["login","Login"],["signup","Sign up"]].map(([value,label])=><button key={value} type="button" disabled={busy} aria-pressed={mode === value} onClick={() => switchMode(value)} className={`auth-button flex-1 text-sm font-semibold ${mode === value ? "bg-indigo-600 text-white" : "text-gray-200 hover:bg-gray-700"}`}>{label}</button>)}</div>
        {errors.general && <div ref={errorRef} tabIndex={-1} role="alert" className="mb-4 space-y-2 rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200"><p>{errors.general}</p>{canSignIn && <button type="button" onClick={() => switchMode("login")} className="auth-button underline">Switch to sign in</button>}</div>}
        {notice && <p role="status" className="mb-4 rounded-lg border border-gray-600 p-3 text-sm text-gray-200">{notice}</p>}
        <form onSubmit={event => { event.preventDefault(); start(mode); }} noValidate aria-busy={busy} className="space-y-4">
          <div><label htmlFor="auth-email" className="mb-2 block text-sm font-medium text-white">Email address</label><div className="relative"><Mail aria-hidden="true" size={20} className="pointer-events-none absolute left-3 top-3.5 text-gray-300"/><input ref={emailRef} id="auth-email" name="email" type="email" autoComplete="email" required disabled={busy} value={email} onChange={changeEmail} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "auth-email-error" : undefined} placeholder="you@example.com" className="auth-input auth-email-input"/></div>{errors.email && <p id="auth-email-error" role="alert" className="mt-2 text-sm text-red-200">{errors.email}</p>}</div>
          <div><label htmlFor="auth-password" className="mb-2 block text-sm font-medium text-white">Password</label><div className="relative"><Lock aria-hidden="true" size={20} className="pointer-events-none absolute left-3 top-3.5 text-gray-300"/><input ref={passwordRef} id="auth-password" name="password" type={visible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required disabled={busy} value={password} onChange={changePassword} aria-invalid={Boolean(errors.password)} aria-describedby={[mode === "signup" ? "auth-password-help" : "",errors.password ? "auth-password-error" : ""].filter(Boolean).join(" ") || undefined} placeholder={mode === "login" ? "Enter your password" : "Create a password"} className="auth-input auth-password-input"/><button type="button" disabled={busy} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible(value => !value)} className="auth-password-toggle auth-icon-button text-gray-200 hover:bg-gray-700">{visible ? <EyeOff aria-hidden="true" size={20}/> : <Eye aria-hidden="true" size={20}/>}</button></div>{mode === "signup" && <p id="auth-password-help" className="mt-2 text-xs text-gray-300">Use at least 6 characters.</p>}{errors.password && <p id="auth-password-error" role="alert" className="mt-2 text-sm text-red-200">{errors.password}</p>}</div>
          {mode === "login" && <div className="flex justify-end"><button type="button" disabled={busy} onClick={() => setResetOpen(true)} className="auth-button text-sm text-indigo-200 underline hover:bg-gray-800">Forgot password?</button></div>}
          <button type="submit" disabled={busy} className="auth-button w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-300">{busy ? <><Loader aria-hidden="true" size={18} className="animate-spin"/>{progress}</> : mode === "login" ? "Sign in" : "Create account"}</button>
          <p role="status" className="sr-only">{busy ? progress : ""}</p>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-gray-300"><span className="h-px flex-1 bg-gray-700"/>Or continue with<span className="h-px flex-1 bg-gray-700"/></div>
        <button ref={googleRef} type="button" disabled={busy} onClick={() => start("google")} className="auth-button w-full bg-white font-semibold text-gray-950 hover:bg-gray-100 disabled:opacity-60"><GoogleMark/>Continue with Google</button>
      </div>
      <p className="mt-5 text-center text-xs text-gray-300">© {new Date().getFullYear()} TapeSure. All rights reserved.</p>
    </section>
  </div>{resetOpen && <PasswordResetDialog initialEmail={email} onClose={() => setResetOpen(false)}/>}</main>;
}
