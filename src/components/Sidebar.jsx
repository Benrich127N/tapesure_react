import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Calendar, MessageSquare, LogOut, Home, Briefcase, Users, ClipboardList, Settings, ChevronLeft, ChevronRight, X, Ruler } from "lucide-react";
import { accountInitial } from "../utils/navigation";

const items = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Orders", path: "/outfits", icon: Briefcase },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Customers", path: "/clients", icon: Users },
  { name: "Invoices", path: "/invoices", icon: ClipboardList },
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "Measurements", path: "/measurements", icon: Ruler },
];
const feedbackURL = `https://wa.me/2349063420516?text=${encodeURIComponent("Hello! I'm using TapeSure and I have some feedback: ")}`;

export default function Sidebar({ mobileOpen, setMobileOpen, accountName }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const logoutPending = useRef(false);
  const dialogRef = useRef(null);
  const closeReason = useRef("dismiss");
  const name = (accountName ?? auth.currentUser?.displayName) || "Tailor";
  const initial = accountInitial(accountName, auth.currentUser);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      if (media.matches && mobileOpen) { closeReason.current = "resize"; setMobileOpen(false); }
    };
    media.addEventListener("change", resize);
    resize();
    return () => media.removeEventListener("change", resize);
  }, [mobileOpen, setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen || window.matchMedia("(min-width: 1024px)").matches) return;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    closeReason.current = "dismiss";
    dialog.showModal();
    dialog.querySelector("button")?.focus();
    return () => {
      dialog.close();
      if (closeReason.current === "navigation") return;
      if (window.matchMedia("(min-width: 1024px)").matches) {
        document.querySelector('.workspace-sidebar [aria-current="page"]')?.focus();
      } else if (previous?.isConnected) previous.focus();
    };
  }, [mobileOpen]);

  const keepFocusInside = event => {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll('a[href], button:not(:disabled)')].filter(element => element.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    else if (!controls.includes(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
  };
  const close = () => { closeReason.current = "dismiss"; setMobileOpen(false); };
  const follow = event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    closeReason.current = "navigation";
    setMobileOpen(false);
    requestAnimationFrame(() => {
      const main = document.getElementById("workspace-content");
      const heading = main?.querySelector("h1");
      if (heading) heading.setAttribute("tabindex", "-1");
      (heading || main)?.focus({ preventScroll: true });
    });
  };
  const logout = async () => {
    if (logoutPending.current) return;
    logoutPending.current = true; setLoggingOut(true); setLogoutError("");
    try { await signOut(auth); setMobileOpen(false); navigate("/login", { replace: true }); }
    catch {
      setLogoutError("Could not log out. Check your connection and try again.");
      if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed(false);
      requestAnimationFrame(() => document.getElementById(window.innerWidth >= 1024 ? "desktop-logout-error" : "mobile-logout-error")?.focus());
    } finally { logoutPending.current = false; setLoggingOut(false); }
  };
  const content = (compact, mobile) => <>
    <div className={`workspace-sidebar-header flex shrink-0 items-center border-b border-gray-800 p-3 ${compact ? "justify-center" : "justify-between"}`}>
      {!compact && <span className="text-xl font-bold tracking-wide text-white">Tape<span className="text-indigo-300">Sure</span></span>}
      {mobile ? <button type="button" aria-label="Close navigation" onClick={close} className="workspace-icon-button text-gray-200 hover:bg-gray-800"><X aria-hidden="true" size={22}/></button> : <button type="button" aria-label={compact ? "Expand navigation" : "Collapse navigation"} aria-expanded={!compact} onClick={() => setCollapsed(value => !value)} className="workspace-icon-button text-gray-300 hover:bg-gray-800">{compact ? <ChevronRight aria-hidden="true" size={20}/> : <ChevronLeft aria-hidden="true" size={20}/>}</button>}
    </div>
    <nav aria-label="Workspace" className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-2 py-4">
      {items.map(item => <NavLink key={item.path} to={item.path} end={item.path === "/"} onClick={follow} aria-label={item.name} title={compact ? item.name : undefined} className={({isActive}) => `flex min-h-11 items-center gap-3 rounded-lg p-3 text-sm font-medium ${isActive ? "bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/30" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}><item.icon aria-hidden="true" size={20} className="shrink-0"/>{!compact && <span>{item.name}</span>}</NavLink>)}
      <div className="border-t border-gray-800 pt-3"><a href={feedbackURL} target="_blank" rel="noopener noreferrer" aria-label="Give feedback (opens WhatsApp in a new tab)" title={compact ? "Give feedback" : undefined} className="flex min-h-11 items-center gap-3 rounded-lg p-3 text-sm text-green-300 hover:bg-gray-800"><MessageSquare aria-hidden="true" size={20} className="shrink-0"/>{!compact && <span>Give feedback</span>}</a></div>
      <div className="border-t border-gray-800 pt-3"><button type="button" onClick={logout} disabled={loggingOut} aria-label={loggingOut ? "Logging out" : "Logout"} aria-busy={loggingOut} title={compact ? "Logout" : undefined} className="flex min-h-11 w-full items-center gap-3 rounded-lg p-3 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-60"><LogOut aria-hidden="true" size={20} className="shrink-0 text-red-300"/>{!compact && <span>{loggingOut ? "Logging out…" : "Logout"}</span>}</button>{logoutError && <p id={mobile ? "mobile-logout-error" : "desktop-logout-error"} role="alert" tabIndex={-1} className="mt-2 break-words rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">{logoutError}</p>}</div>
    </nav>
    <div className={`flex shrink-0 items-center gap-3 border-t border-gray-800 p-4 ${compact ? "justify-center" : ""}`}><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{initial}</span>{!compact && <div className="min-w-0"><p title={name} className="truncate text-sm font-medium text-white">{name}</p><p title={auth.currentUser?.email} className="truncate text-xs text-gray-300">{auth.currentUser?.email || "Account"}</p></div>}</div>
  </>;
  return <>
    <aside aria-label="Workspace navigation" className={`workspace-sidebar hidden h-dvh shrink-0 flex-col border-r border-gray-800 bg-gray-900 lg:flex ${collapsed ? "w-20" : "w-64"}`}>{content(collapsed,false)}</aside>
    {createPortal(<dialog ref={dialogRef} id="workspace-navigation" aria-label="Workspace navigation" aria-modal="true" className="workspace-drawer bg-gray-900 text-gray-100" onKeyDown={keepFocusInside} onClose={event => { if (!event.currentTarget.open) setMobileOpen(false); }} onClick={event => { if (event.target !== event.currentTarget) return; const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close(); }}>{content(false,true)}</dialog>, document.body)}
  </>;
}
