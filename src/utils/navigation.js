export function accountInitial(name, user) {
  return String(name ?? user?.displayName ?? "").trim().charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "T";
}

export function orderSearchDestination(pathname, currentSearch, draft) {
  const params = new URLSearchParams(pathname === "/outfits" ? currentSearch : "");
  const term = draft.trim();
  if (term) params.set("q", term);
  else params.delete("q");
  return `/outfits${params.size ? `?${params}` : ""}`;
}
