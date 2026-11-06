import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { X } from "lucide-react";
import { authErrorMessage, validateAuth } from "../utils/auth";

export default function PasswordResetDialog({ initialEmail, onClose }) {
  const [email, setEmail] = useState(initialEmail.trim());
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const confirmationRef = useRef(null);
  const active = useRef(false);
  const pending = useRef(false);
  useEffect(() => {
    active.current = true;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal(); inputRef.current?.focus();
    return () => { active.current = false; dialog.close(); const target = previous?.isConnected && !previous.disabled ? previous : document.getElementById("auth-email"); target?.focus(); };
  }, []);
  useEffect(() => { if (sentEmail) confirmationRef.current?.focus(); }, [sentEmail]);
  const submit = async event => {
    event.preventDefault();
    if (pending.current) return;
    const address = email.trim();
    const emailError = validateAuth("login", address, "unused").email;
    if (emailError) { setError(emailError); setFieldError(true); inputRef.current?.focus(); return; }
    pending.current = true; setSending(true); setError(""); setFieldError(false);
    try {
      await sendPasswordResetEmail(auth, address);
      if (active.current) setSentEmail(address);
    } catch (cause) {
      if (!active.current) return;
      if (cause.code === "auth/user-not-found") setSentEmail(address);
      else setError(authErrorMessage(cause, "reset"));
    } finally { pending.current = false; if (active.current) setSending(false); }
  };
  const trap = event => {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll('button:not(:disabled), input:not(:disabled)')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    else if (!controls.includes(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
  };
  const close = () => dialogRef.current?.close();
  return createPortal(<dialog ref={dialogRef} aria-labelledby="reset-title" aria-describedby="reset-description" className="auth-reset-dialog rounded-xl border border-gray-600 bg-gray-900 p-5 text-gray-100 shadow-2xl" onKeyDown={trap} onClose={event => { if (!event.currentTarget.open) onClose(); }}>
    <header className="mb-3 flex items-center justify-between gap-3"><h2 id="reset-title" className="text-xl font-bold">Reset password</h2><button type="button" onClick={close} aria-label="Close password reset" className="auth-icon-button shrink-0 text-gray-200 hover:bg-gray-800"><X aria-hidden="true" size={20}/></button></header>
    <p id="reset-description" className="mb-5 text-sm leading-6 text-gray-300">Request a link to reset the password for your account.</p>
    {sentEmail ? <><div ref={confirmationRef} tabIndex={-1} role="status" className="space-y-2 rounded-lg border border-green-800 bg-green-900/20 p-4 text-sm text-green-200"><p className="font-semibold">Check your email</p><p>If an account exists for <strong className="break-words">{sentEmail}</strong>, check its inbox for reset instructions. The email may take a few minutes; check your spam folder too.</p></div><button type="button" onClick={close} className="auth-button mt-5 w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500">Done</button></> : <form onSubmit={submit} noValidate aria-busy={sending} className="space-y-4">
      <div><label htmlFor="reset-email" className="mb-2 block text-sm font-medium">Email address</label><input ref={inputRef} id="reset-email" name="email" type="email" autoComplete="email" required disabled={sending} value={email} onChange={event => { setEmail(event.target.value); setError(""); setFieldError(false); }} aria-invalid={fieldError} aria-describedby={error ? "reset-error" : undefined} className="auth-input" placeholder="you@example.com"/></div>
      {error && <p id="reset-error" role="alert" className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">{error}</p>}
      <div className="flex flex-wrap gap-3"><button type="button" onClick={close} className="auth-button flex-1 border border-gray-600 text-gray-100 hover:bg-gray-800">{sending ? "Close" : "Cancel"}</button><button type="submit" disabled={sending} className="auth-button flex-1 bg-indigo-600 font-semibold text-white hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-300">{sending ? "Sending…" : "Send reset link"}</button></div><p role="status" className="sr-only">{sending ? "Requesting your password reset link." : ""}</p>
    </form>}
  </dialog>, document.body);
}
