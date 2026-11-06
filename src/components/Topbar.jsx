import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { Plus, Search, Menu, X } from "lucide-react";
import { accountInitial, orderSearchDestination } from "../utils/navigation";

export default function Topbar({ onMenuClick, mobileMenuOpen, accountName }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const query = new URLSearchParams(search).get("q") || "";
  const [draft, setDraft] = useState(query);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const name = (accountName ?? auth.currentUser?.displayName) || "Tailor";
  useEffect(() => { setDraft(query); setSearchOpen(false); }, [pathname, query]);
  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const resize = () => {
      if (media.matches && searchOpen) { setSearchOpen(false); inputRef.current?.focus(); }
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, [searchOpen]);
  const dismissSearch = () => { setSearchOpen(false); setDraft(query); triggerRef.current?.focus(); };
  const submit = event => {
    event.preventDefault();
    navigate(orderSearchDestination(pathname, search, draft));
    setSearchOpen(false);
    if (searchOpen) requestAnimationFrame(() => document.getElementById("workspace-content")?.focus());
  };
  return <header className="workspace-topbar shrink-0 border-b border-gray-800 bg-gray-900 px-4 py-3 sm:px-6 lg:px-8">
    <div className="workspace-topbar-row flex items-center gap-2 sm:gap-3">
      <button type="button" onClick={onMenuClick} aria-controls="workspace-navigation" aria-expanded={mobileMenuOpen} aria-label="Open navigation" className="workspace-icon-button shrink-0 text-gray-200 hover:bg-gray-800 lg:hidden"><Menu aria-hidden="true" size={24}/></button>
      <button ref={triggerRef} type="button" aria-label="Open order search" aria-expanded={searchOpen} aria-controls="workspace-order-search" onClick={() => setSearchOpen(value => !value)} className="workspace-mobile-search-trigger flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-600 px-3 text-sm text-gray-200"><Search aria-hidden="true" size={18}/><span>Search</span></button>
      <form id="workspace-order-search" role="search" aria-label="Search orders" onSubmit={submit} className={`workspace-order-search min-w-0 flex-1 ${searchOpen ? "is-open" : ""}`} onKeyDown={event => { if (event.key === "Escape" && searchOpen) { event.preventDefault(); dismissSearch(); } }}>
        <div className="flex min-w-0 items-center gap-2"><label htmlFor="workspace-order-query" className="sr-only">Search orders</label><input ref={inputRef} id="workspace-order-query" type="search" autoComplete="off" placeholder="Search orders…" value={draft} onChange={event => setDraft(event.target.value)} className="min-h-11 min-w-0 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 text-base text-white placeholder-gray-400"/><button type="submit" aria-label="Submit order search" title="Search orders" className="workspace-icon-button shrink-0 bg-indigo-600 text-white hover:bg-indigo-500"><Search aria-hidden="true" size={20}/></button><button type="button" aria-label="Close order search" onClick={dismissSearch} className="workspace-search-close workspace-icon-button shrink-0 text-gray-200 hover:bg-gray-800"><X aria-hidden="true" size={20}/></button></div>
      </form>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
        <button type="button" onClick={() => navigate("/outfits/new")} aria-label="New order" title="New order" className="workspace-icon-button gap-2 bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-500 sm:px-4"><Plus aria-hidden="true" size={18}/><span className="hidden sm:inline">New order</span></button>
        <div className="flex items-center gap-3 sm:border-l sm:border-gray-700 sm:pl-4"><p title={name} className="hidden max-w-48 truncate text-sm font-semibold text-white xl:block">{name}</p><button type="button" aria-label="Account settings" title="Account settings" onClick={() => navigate("/settings")} className="workspace-icon-button rounded-full border-2 border-indigo-500 bg-gray-950 text-sm font-bold text-white">{accountInitial(accountName,auth.currentUser)}</button></div>
      </div>
    </div>
  </header>;
}
